import { setupAuthObserver, logoutUser } from './api/auth.js';
import { db } from './api/firebase.js';
import { store } from './store.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import { LoginView } from './views/LoginView.js';
import { routes } from './router.js';
import { attachEventListeners } from './listeners.js';
import { handleLogin, handleStartQuiz } from './handlers.js';

const appRoot = document.getElementById('app-root');

export function render(html, listenersCallback) {
    appRoot.innerHTML = html;
    if (listenersCallback) {
        listenersCallback();
    } else {
        attachEventListeners();
    }
}

export function showLoading(message = 'A carregar...') {
    appRoot.innerHTML = `<div class="container" style="text-align: center; padding-top: 4rem;"><div class="spinner"></div><p>${message}</p></div>`;
}

function extractParams(route, hash) {
    const values = hash.match(new RegExp(`^${route.replace(/:\w+/g, '([\\w-]+)')}$`));
    if (!values) return {};
    const keys = (route.match(/:\w+/g) || []).map(k => k.substring(1));
    return keys.reduce((acc, key, i) => ({ ...acc, [key]: values[i + 1] }), {});
}

export function navigate() {
    store.cleanup();
    if (!store.user || !store.userData) {
        render(LoginView());
        return;
    }

    const hash = window.location.hash || (store.userData.role === 'teacher' ? '#dashboard' : '#student/dashboard');
    const role = store.userData.role;
    const routeKey = Object.keys(routes).find(r => new RegExp(`^${r.replace(/:\w+/g, '([\\w-]+)')}$`).test(hash));

    if (hash === '#login' && store.user) {
        window.location.hash = role === 'teacher' ? '#dashboard' : '#student/dashboard';
        return;
    }

    if (routeKey && (!routes[routeKey].role || routes[routeKey].role === role)) {
        const params = extractParams(routeKey, hash);
        routes[routeKey].view(params);
    } else {
        window.location.hash = role === 'teacher' ? '#dashboard' : '#student/dashboard';
    }
}

function main() {
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        const navLink = target.closest('a[href^="#"]');
        const button = target.closest('button');

        if (navLink) {
            e.preventDefault();
            const hash = navLink.getAttribute('href');
            if (window.location.hash !== hash) {
                window.location.hash = hash;
            } else {
                navigate(); 
            }
            return;
        }

        if (button) {
            if (button.id === 'logout-btn') logoutUser();
            if (button.matches('.start-quiz-btn')) window.location.hash = `#student/attempt/${button.dataset.attemptId}`;
            if (button.matches('.view-attempt-details-btn')) window.location.hash = `#results/attempt/${button.dataset.attemptId}`;
            if (button.matches('.start-live-quiz-btn')) handleStartQuiz(button.dataset.quizId);
            if (button.matches('.view-review-btn')) window.location.hash = `#student/review/${button.dataset.attemptId}`;
        }
    });

    window.addEventListener('hashchange', navigate);

    setupAuthObserver(
        async (user) => { // onLogin
            store.user = user;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                store.userData = userDoc.data();
                const targetHash = window.location.hash === '#login' || window.location.hash === ''
                    ? (userDoc.data().role === 'teacher' ? '#dashboard' : '#student/dashboard')
                    : window.location.hash;
                if (window.location.hash !== targetHash) {
                    window.location.hash = targetHash;
                } else {
                    navigate();
                }
            } else {
                console.error("Documento de perfil do utilizador não encontrado! A terminar a sessão.");
                logoutUser();
            }
        },
        () => { // onLogout
            store.user = null;
            store.userData = null;
            window.location.hash = '#login';
            render(LoginView());
        }
    );
}

main();
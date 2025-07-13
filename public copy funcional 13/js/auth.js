import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, // Importa a nova função
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import { auth } from './api/firebase.js';

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Nova função para registrar um novo usuário
export const registerUserWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

export const logoutUser = () => {
    return signOut(auth);
};

export const setupAuthObserver = (onLogin, onLogout) => {
    onAuthStateChanged(auth, user => {
        if (user) {
            onLogin(user);
        } else {
            onLogout();
        }
    });
};

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

// --- ATENÇÃO: CONFIGURAÇÃO DO FIREBASE ---
// Substitua este objeto de configuração pelo do seu próprio projeto Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyALvWVp38Xy0iwTvXMg5OkWhqiQ8oDXD6E",
    authDomain: "quizifmuz.firebaseapp.com",
    databaseURL: "https://quizifmuz-default-rtdb.firebaseio.com",
    projectId: "quizifmuz",
    storageBucket: "quizifmuz.firebasestorage.app",
    messagingSenderId: "621559995106",
    appId: "1:621559995106:web:9f6039d14fa239e06fdcbb"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta as instâncias para serem usadas em outros módulos
export { auth, db };

// Usamos uma string para o ID do app para evitar conflitos no backend do Firebase
export const appId = 'codehoot-vanilla-app';

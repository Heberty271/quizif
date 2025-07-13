import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import { auth } from './firebase.js';

export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerUserWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const setupAuthObserver = (onLogin, onLogout) => onAuthStateChanged(auth, user => user ? onLogin(user) : onLogout());

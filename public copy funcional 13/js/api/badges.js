import { db } from './firebase.js';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

const allBadges = {
    'first_quiz': { name: 'Pioneiro', description: 'Completou a sua primeira prova!', icon: '🚀' },
    'invincible': { name: 'Invencível', description: 'Acertou todas as questões de uma prova sem pular nenhuma.', icon: '🏆' },
    'top_gun': { name: 'Top Gun', description: 'Ficou em 1º lugar numa prova com mais de 3 participantes.', icon: '🥇' },
    'weekend_coder': { name: 'Programador de Fim de Semana', description: 'Completou uma prova durante o fim de semana.', icon: '🌙' },
    'night_owl': { name: 'Falcão Noturno', description: 'Completou uma prova entre as 22h e as 6h.', icon: '🦉' },
    'marathoner': { name: 'Maratonista', description: 'Completou uma prova com mais de 10 questões.', icon: '🏃' },
    'perfect_score_ai': { name: 'Mestre do Código', description: 'Recebeu nota 10 da IA numa questão de código.', icon: '🤖' },
    'speed_demon': { name: 'Demônio da Velocidade', description: 'Acertou uma questão em menos de 5 segundos.', icon: '💨' },
    'under_pressure': { name: 'Sob Pressão', description: 'Acertou uma questão com menos de 3 segundos no relógio.', icon: '⏳' },
    'hat_trick': { name: 'Hat-Trick', description: 'Acertou 3 questões seguidas.', icon: '🔥' },
    'unstoppable': { name: 'Imparável', description: 'Acertou 5 questões seguidas.', icon: '🔥🔥' },
};

export async function awardBadge(userId, badgeId) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const existingBadges = userData.badges || [];

    if (!existingBadges.includes(badgeId)) {
        await updateDoc(userRef, {
            badges: arrayUnion(badgeId)
        });
        return true; // Nova conquista
    }
    return false; // Conquista já existia
}

export async function checkAndAwardBadges(userId, attemptId, quizId) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const existingBadges = userData.badges || [];
    const newBadges = [];

    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);
    const attemptData = attemptSnap.data();
    
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    const quizData = quizSnap.data();

    // --- Conquistas de Fim de Prova ---

    const attemptsQuery = query(collection(db, 'quizAttempts'), where("studentId", "==", userId), where("status", "==", "completed"));
    const userAttemptsSnap = await getDocs(attemptsQuery);
    if (userAttemptsSnap.size === 1 && !existingBadges.includes('first_quiz')) {
        newBadges.push('first_quiz');
    }

    if (userAttemptsSnap.size >= 5 && !existingBadges.includes('dedicated')) {
        newBadges.push('dedicated');
    }

    if (attemptData.incorrectCount === 0 && attemptData.answers.length === quizData.questions.length && !existingBadges.includes('invincible')) {
        newBadges.push('invincible');
    }

    const hasPerfectAICode = attemptData.answers.some(ans => ans.type === 'coding' && ans.manualGrade === 10);
    if (hasPerfectAICode && !existingBadges.includes('perfect_score_ai')) {
        newBadges.push('perfect_score_ai');
    }

    const completionDate = attemptData.completedAt.toDate();
    const dayOfWeek = completionDate.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !existingBadges.includes('weekend_coder')) {
        newBadges.push('weekend_coder');
    }

    const completionHour = completionDate.getHours();
    if ((completionHour >= 22 || completionHour < 6) && !existingBadges.includes('night_owl')) {
        newBadges.push('night_owl');
    }

    if (quizData.questions.length > 10 && !existingBadges.includes('marathoner')) {
        newBadges.push('marathoner');
    }
    
    const allAttemptsForQuizQuery = query(collection(db, 'quizAttempts'), where("quizId", "==", quizId), where("status", "==", "completed"));
    const allAttemptsSnap = await getDocs(allAttemptsForQuizQuery);
    if (allAttemptsSnap.size > 3) {
        const leaderboard = allAttemptsSnap.docs.map(d => d.data()).sort((a, b) => b.totalScore - a.totalScore);
        if (leaderboard[0].studentId === userId && !existingBadges.includes('top_gun')) {
            newBadges.push('top_gun');
        }
    }

    if (newBadges.length > 0) {
        await updateDoc(userRef, {
            badges: arrayUnion(...newBadges)
        });
    }
    
    return newBadges.map(id => allBadges[id]);
}

export function getBadgeDetails(badgeId) {
    return allBadges[badgeId];
}
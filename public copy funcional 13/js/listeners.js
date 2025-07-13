import { handleLogin, handleRegisterStudent, handleCreateClass, handleAddStudentToClass, handleSaveQuiz, handleSaveQuestionToBank, handleUpdateProfile } from './handlers.js';
import { attachQuizEditorListeners, attachResultsDashboardListeners, attachAttemptDetailListeners, updateQuestionsFromDOM, attachTeacherLiveResultsListeners, attachQuestionBankListeners, attachQuestionEditorListeners, updateSingleQuestionFromDOM, attachGradesReportListeners } from './views/teacher-views.js';
import { attachQuizAttemptListeners, attachStudentAttemptReviewListeners, attachProfileViewListeners } from './views/student-views.js';
import { store } from './store.js';

export function attachEventListeners() {
    // Forms
    document.querySelector('#login-form')?.addEventListener('submit', handleLogin);
    document.querySelector('#register-student-form')?.addEventListener('submit', handleRegisterStudent);
    document.querySelector('#create-class-form')?.addEventListener('submit', handleCreateClass);
    document.querySelector('#add-student-form')?.addEventListener('submit', handleAddStudentToClass);
    document.querySelector('#quiz-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const questions = store.currentQuiz.questions;
        handleSaveQuiz(questions);
    });
    document.querySelector('#question-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const questionData = updateSingleQuestionFromDOM();
        handleSaveQuestionToBank(questionData);
    });
    document.querySelector('#profile-form')?.addEventListener('submit', handleUpdateProfile);
    
    // Listeners de contexto específico
    const hash = window.location.hash;

    if (hash.startsWith('#quiz/new') || hash.startsWith('#quiz/edit')) {
        attachQuizEditorListeners();
    }
    if (hash.startsWith('#question-bank')) {
        attachQuestionBankListeners();
    }
    if (hash.startsWith('#question/new') || hash.startsWith('#question/edit')) {
        attachQuestionEditorListeners();
    }
    if (hash.startsWith('#student/attempt')) {
        attachQuizAttemptListeners();
    }
    if (hash.startsWith('#student/review')) {
        attachStudentAttemptReviewListeners();
    }
    if (hash.startsWith('#student/profile')) {
        attachProfileViewListeners();
    }
    if (hash.startsWith('#results') && !hash.includes('/attempt/') && !hash.includes('/live/')) {
        attachResultsDashboardListeners();
    }
    if (hash.startsWith('#grades-report')) {
        attachGradesReportListeners();
    }
    if (hash.startsWith('#results/attempt/')) {
        attachAttemptDetailListeners();
    }
    if (hash.startsWith('#live/results/')) {
        attachTeacherLiveResultsListeners();
    }
}
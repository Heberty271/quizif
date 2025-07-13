export const store = {
    user: null,
    userData: null,
    quizzes: [],
    allAttempts: [],
    allStudents: [],
    allClasses: [],
    assignedQuizzes: [],
    currentQuiz: null,
    currentClass: null,
    currentAttempt: null,
    codeEditors: {},
    unsubscribeListeners: [],
    
    cleanup() {
        this.unsubscribeListeners.forEach(unsubscribe => unsubscribe());
        this.unsubscribeListeners = [];
    }
};
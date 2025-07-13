import { LoginView } from './views/LoginView.js';
import { 
    showTeacherDashboard, 
    showStudentRegistry, 
    showClassManager, 
    showClassDetail, 
    showQuizEditor, 
    showQuizDetail, 
    showResultsDashboard, 
    showAttemptDetail,
    showLiveQuizDashboard,
    showTeacherLiveResults,
    showQuestionBank,
    showQuestionEditor,
    showGradesReport // NOVO
} from './views/teacher-views.js';
import { 
    showStudentDashboard, 
    showQuizAttempt,
    showStudentAttemptReview,
    showStudentProfile
} from './views/student-views.js';

export const routes = {
    '#login': { view: LoginView },
    // Professor
    '#dashboard': { view: showTeacherDashboard, role: 'teacher' },
    '#students': { view: showStudentRegistry, role: 'teacher' },
    '#classes': { view: showClassManager, role: 'teacher' },
    '#class/detail/:id': { view: showClassDetail, role: 'teacher' },
    '#quiz/new': { view: showQuizEditor, role: 'teacher' },
    '#quiz/edit/:id': { view: showQuizEditor, role: 'teacher' },
    '#quiz/detail/:id': { view: showQuizDetail, role: 'teacher' },
    '#results': { view: showResultsDashboard, role: 'teacher' },
    '#grades-report': { view: showGradesReport, role: 'teacher' }, // NOVO
    '#results/attempt/:id': { view: showAttemptDetail, role: 'teacher' },
    '#live-dashboard': { view: showLiveQuizDashboard, role: 'teacher' },
    '#live/results/:quizId': { view: showTeacherLiveResults, role: 'teacher' },
    '#question-bank': { view: showQuestionBank, role: 'teacher' },
    '#question/new/:type': { view: showQuestionEditor, role: 'teacher' },
    '#question/edit/:id': { view: showQuestionEditor, role: 'teacher' },
    // Aluno
    '#student/dashboard': { view: showStudentDashboard, role: 'student' },
    '#student/profile': { view: showStudentProfile, role: 'student' },
    '#student/attempt/:id': { view: showQuizAttempt, role: 'student' },
    '#student/review/:id': { view: showStudentAttemptReview, role: 'student' },
};
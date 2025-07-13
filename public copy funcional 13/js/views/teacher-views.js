import { render, showLoading } from '../main.js';
import { store } from '../store.js';
import { db } from '../api/firebase.js';
import { collection, query, where, onSnapshot, getDoc, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

// Importa os templates HTML
import { TeacherDashboardView } from './TeacherDashboard.js';
import { StudentRegistryView } from './StudentRegistryView.js';
import { ClassManagerView } from './ClassManager.js';
import { ClassDetailView } from './ClassDetailView.js';
import { QuizEditorView, renderCurrentQuestions } from './QuizEditor.js';
import { QuizDetailView } from './QuizDetailView.js';
import { ResultsDashboardView } from './ResultsDashboardView.js';
import { AttemptDetailView } from './AttemptDetailView.js';
import { LiveQuizDashboardView } from './LiveQuizDashboardView.js';
import { TeacherLiveResultView } from './TeacherLiveResultView.js';
import { QuestionBankView } from './QuestionBankView.js';
import { QuestionEditorView } from './QuestionEditorView.js';
import { QuestionBankModalView } from './QuestionBankModalView.js';
import { GradesReportView } from './GradesReportView.js';

// --- Funções de Renderização das Views do Professor ---

export function showTeacherDashboard() {
    render(TeacherDashboardView());
}


export async function showStudentRegistry() {
    showLoading();
    const q = query(collection(db, 'users'), where("role", "==", "student"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render(StudentRegistryView(students));
    });
    store.unsubscribeListeners.push(unsubscribe);
}

export async function showClassManager() {
    showLoading();
    const q = query(collection(db, 'classes'), where("teacherId", "==", store.user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render(ClassManagerView(classes));
    });
    store.unsubscribeListeners.push(unsubscribe);
}

export async function showClassDetail(params) {
    showLoading();
    const classId = params.id;
    
    const classRef = doc(db, 'classes', classId);
    const studentsQuery = query(collection(db, 'users'), where("role", "==", "student"));

    const [classSnap, studentsSnap] = await Promise.all([getDoc(classRef), getDocs(studentsQuery)]);
    
    if (classSnap.exists() && classSnap.data().teacherId === store.user.uid) {
        const classData = { id: classSnap.id, ...classSnap.data() };
        const allStudents = studentsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        store.currentClass = classData;
        
        const availableStudents = allStudents.filter(student => 
            !classData.students.some(classStudent => classStudent.uid === student.uid)
        );

        render(ClassDetailView(classData, availableStudents));
    } else {
        alert("Turma não encontrada ou não autorizada.");
        window.location.hash = '#classes';
    }
}

export async function showQuizEditor(params) {
    const quizId = params?.id;
    let quiz = {
        title: '',
        description: '',
        classId: '',
        questions: []
    };
    if (quizId) {
        showLoading("A carregar quiz...");
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().creatorId === store.user.uid) {
            quiz = { id: docSnap.id, ...docSnap.data() };
        } else {
            alert("Quiz não encontrado ou não autorizado.");
            window.location.hash = '#dashboard';
            return;
        }
    }
    store.currentQuiz = quiz;

    const classQuery = query(collection(db, 'classes'), where("teacherId", "==", store.user.uid));
    const classSnapshot = await getDocs(classQuery);
    const teacherClasses = classSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    render(QuizEditorView(quiz, teacherClasses));
}

export async function showQuestionBank() {
    showLoading("A carregar o seu banco de questões...");
    const q = query(collection(db, 'questionBank'), where("creatorId", "==", store.user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render(QuestionBankView(questions));
    });
    store.unsubscribeListeners.push(unsubscribe);
}

export async function showQuestionEditor(params) {
    const questionId = params?.id;
    const newQuestionType = params?.type;
    let question = {};

    if (questionId) {
        showLoading("A carregar questão...");
        const docRef = doc(db, 'questionBank', questionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().creatorId === store.user.uid) {
            question = { id: docSnap.id, ...docSnap.data() };
        } else {
            alert("Questão não encontrada ou não autorizada.");
            window.location.hash = '#question-bank';
            return;
        }
    } else if (newQuestionType) {
        question.type = newQuestionType;
    } else {
        alert("Tipo de questão inválido.");
        window.location.hash = '#question-bank';
        return;
    }
    
    store.currentQuestion = question;
    render(QuestionEditorView(question));
}

export async function showQuizDetail(params) {
    showLoading();
    const quizId = params.id;
    const docRef = doc(db, 'quizzes', quizId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().creatorId !== store.user.uid) {
        alert("Quiz não encontrado ou não autorizado.");
        window.location.hash = '#dashboard';
        return;
    }

    store.currentQuiz = { id: docSnap.id, ...docSnap.data() };
    render(QuizDetailView(store.currentQuiz));
    loadAttemptsForQuiz(quizId);
}

export async function showResultsDashboard() {
    showLoading("A carregar todos os resultados...");
    
    const attemptsQuery = query(collection(db, 'quizAttempts'), where("teacherId", "==", store.user.uid));
    const quizzesQuery = query(collection(db, 'quizzes'), where("creatorId", "==", store.user.uid));
    const classesQuery = query(collection(db, 'classes'), where("teacherId", "==", store.user.uid));
    const studentsQuery = query(collection(db, 'users'), where("role", "==", "student"));

    try {
        const [attemptsSnap, quizzesSnap, classesSnap, studentsSnap] = await Promise.all([
            getDocs(attemptsQuery), getDocs(quizzesQuery),
            getDocs(classesQuery), getDocs(studentsQuery)
        ]);

        const allAttempts = attemptsSnap.docs.map(d => ({id: d.id, ...d.data()}));
        const allQuizzes = quizzesSnap.docs.map(d => ({id: d.id, ...d.data()}));
        const allClasses = classesSnap.docs.map(d => ({id: d.id, ...d.data()}));
        const allStudents = studentsSnap.docs.map(d => ({id: d.id, ...d.data()}));
        
        store.quizzes = allQuizzes;
        store.allStudents = allStudents;
        store.allClasses = allClasses;
        store.allAttempts = allAttempts;

        const enrichedAttempts = allAttempts.map(attempt => {
            const quiz = allQuizzes.find(q => q.id === attempt.quizId);
            const aClass = quiz ? allClasses.find(c => c.id === quiz.classId) : null;
            return { ...attempt, className: aClass ? aClass.className : 'N/A' };
        });

        render(ResultsDashboardView(enrichedAttempts, allQuizzes, allClasses, allStudents));
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard de resultados:", error);
        alert("Ocorreu um erro ao carregar os resultados.");
    }
}

export async function showAttemptDetail(params) {
    showLoading("A carregar detalhes da avaliação...");
    const attemptId = params.id;
    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);

    if (!attemptSnap.exists() || attemptSnap.data().teacherId !== store.user.uid) {
        alert("Avaliação não encontrada ou não autorizada.");
        window.location.hash = '#results';
        return;
    }

    const attempt = {id: attemptSnap.id, ...attemptSnap.data()};
    const quizRef = doc(db, 'quizzes', attempt.quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
        alert("Erro: O quiz correspondente a esta avaliação não foi encontrado.");
        window.location.hash = '#results';
        return;
    }

    const quiz = {id: quizSnap.id, ...quizSnap.data()};
    render(AttemptDetailView(quiz, attempt, quiz.yearLevel));
}

export async function showLiveQuizDashboard() {
    showLoading("A carregar quizzes...");
    const q = query(collection(db, 'quizzes'), where("creatorId", "==", store.user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render(LiveQuizDashboardView(quizzes));
    });
    store.unsubscribeListeners.push(unsubscribe);
}

export async function showTeacherLiveResults(params) {
    showLoading("A carregar placar ao vivo...");
    const quizId = params.quizId;
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists() || quizSnap.data().creatorId !== store.user.uid) {
        alert("Quiz não encontrado ou não autorizada.");
        window.location.hash = '#dashboard';
        return;
    }
    
    store.currentQuiz = { id: quizSnap.id, ...quizSnap.data() };

    // Busca os dados de todos os alunos uma vez para ter os avatares
    const usersSnap = await getDocs(query(collection(db, 'users'), where("role", "==", "student")));
    const studentAvatars = {};
    usersSnap.forEach(doc => {
        studentAvatars[doc.id] = doc.data().avatar;
    });
    store.studentAvatars = studentAvatars; // Guarda para o listener usar

    render(TeacherLiveResultView(store.currentQuiz));
}


// --- Funções de Anexação de Listeners e Helpers ---

export function attachQuizEditorListeners() {
    const questionsContainer = document.querySelector('#questions-list-container');
    if(!questionsContainer) return;
    
    renderCurrentQuestions(store.currentQuiz.questions, questionsContainer);

    document.querySelector('#add-from-bank-btn').addEventListener('click', async () => {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        modalContainer.innerHTML = QuestionBankModalView([], true);
        document.body.appendChild(modalContainer);

        const closeModal = () => modalContainer.remove();
        
        const attachModalListeners = () => {
            modalContainer.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) closeModal();
            });
            modalContainer.querySelector('#close-modal-btn')?.addEventListener('click', closeModal);
            
            const addButton = modalContainer.querySelector('#add-selected-questions-btn');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    const selectedIds = Array.from(modalContainer.querySelectorAll('input[name="bank-question"]:checked')).map(cb => cb.value);
                    if (selectedIds.length === 0) {
                        alert("Nenhuma questão selecionada.");
                        return;
                    }
                    const selectedQuestions = store.questionBank.filter(q => selectedIds.includes(q.id));
                    
                    store.currentQuiz.questions = store.currentQuiz.questions.concat(selectedQuestions);
                    renderCurrentQuestions(store.currentQuiz.questions, questionsContainer);
                    closeModal();
                });
            }
        };

        attachModalListeners();

        try {
            const q = query(collection(db, 'questionBank'), where("creatorId", "==", store.user.uid));
            const snapshot = await getDocs(q);
            const bankQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            store.questionBank = bankQuestions;
            
            modalContainer.innerHTML = QuestionBankModalView(bankQuestions, false);
            attachModalListeners();

        } catch (error) {
            console.error("Erro ao carregar banco de questões:", error);
            alert("Não foi possível carregar o banco de questões.");
            closeModal();
        }
    });

    questionsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.remove-quiz-question-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index, 10);
            store.currentQuiz.questions.splice(indexToRemove, 1);
            renderCurrentQuestions(store.currentQuiz.questions, questionsContainer);
        }
    });
}



export function attachQuestionBankListeners() {
    document.querySelectorAll('.delete-question-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const questionId = e.currentTarget.dataset.id;
            if (confirm("Tem a certeza que deseja apagar esta questão permanentemente?")) {
                await deleteDoc(doc(db, "questionBank", questionId));
                alert("Questão apagada.");
            }
        });
    });
}

export function attachResultsDashboardListeners() {
    const attempts = store.allAttempts || [];
    const allQuizzes = store.quizzes || [];
    
    const filters = {
        quiz: document.querySelector('#quiz-filter'),
        class: document.querySelector('#class-filter'),
        student: document.querySelector('#student-filter'),
    };
    const tableBody = document.querySelector('#results-table-body');

    const applyFilters = () => {
        const quizId = filters.quiz.value;
        const classId = filters.class.value;
        const studentId = filters.student.value;
        
        const filteredAttempts = attempts.filter(attempt => {
            const quiz = allQuizzes.find(q => q.id === attempt.quizId);
            const quizMatch = !quizId || attempt.quizId === quizId;
            const classMatch = !classId || (quiz && quiz.classId === classId);
            const studentMatch = !studentId || attempt.studentId === studentId;
            return quizMatch && classMatch && studentMatch;
        });
        
        renderResultsTable(filteredAttempts);
    };

    Object.values(filters).forEach(filter => filter?.addEventListener('change', applyFilters));

    const renderResultsTable = (filteredData) => {
        if (!tableBody) return;
        if (filteredData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">Nenhum resultado encontrado.</td></tr>';
        } else {
            tableBody.innerHTML = filteredData.map(attempt => {
                const statusMap = { 'pending': 'Pendente', 'in-progress': 'Em Progresso', 'completed': 'Concluído' };
                return `
                <tr>
                    <td>${attempt.studentEmail}</td>
                    <td>${attempt.quizTitle}</td>
                    <td>${attempt.className}</td>
                    <td>${attempt.totalScore ?? 'N/A'}</td>
                    <td>${attempt.finalGrade ?? 'Aguardando'}</td>
                    <td>${statusMap[attempt.status] || 'Desconhecido'}</td>
                    <td>
                        ${attempt.status === 'completed' ? `<button class="btn btn-secondary btn-inline view-attempt-details-btn" data-attempt-id="${attempt.id}">Ver Respostas</button>` : '-'}
                    </td>
                </tr>
            `}).join('');
        }
    };
    renderResultsTable(attempts);
}

export function attachAttemptDetailListeners() {
    document.querySelectorAll('.preview-pane iframe').forEach((iframe) => {
        const html = iframe.dataset.html || '';
        const css = iframe.dataset.css || '';
        const js = iframe.dataset.js || '';
        const iframeContent = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
        iframe.srcdoc = iframeContent;
    });

    document.querySelectorAll('.ai-feedback-text').forEach(el => {
        const feedback = el.dataset.feedback || 'Sem feedback.';
        el.textContent = feedback;
    });
}

export function attachTeacherLiveResultsListeners() {
    if (!store.currentQuiz) return;
    const quizId = store.currentQuiz.id;

    const q = query(collection(db, 'quizAttempts'), where("quizId", "==", quizId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const attempts = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        
        const leaderboardData = attempts.map(attempt => ({
            name: attempt.studentEmail.split('@')[0],
            score: attempt.totalScore || 0,
            uid: attempt.studentId,
            avatar: store.studentAvatars[attempt.studentId] || `https://api.dicebear.com/8.x/bottts/svg?seed=${attempt.studentEmail}`
        })).sort((a, b) => b.score - a.score);
        
        const podiumContainer = document.querySelector('#podium-container');
        const listContainer = document.querySelector('#list-container');
        if (!podiumContainer || !listContainer) return;

        const waitingMessage = document.querySelector('.waiting-message');
        if (leaderboardData.length === 0) {
            if (waitingMessage) waitingMessage.style.display = 'block';
            podiumContainer.innerHTML = '';
            listContainer.innerHTML = '';
            return;
        } else {
            if(waitingMessage) waitingMessage.style.display = 'none';
        }
        
        const allPlayerUIDsOnBoard = new Set(leaderboardData.map(p => p.uid));
        
        document.querySelectorAll('.player-item').forEach(el => {
            if (!allPlayerUIDsOnBoard.has(el.dataset.id)) {
                el.remove();
            }
        });

        leaderboardData.forEach((player, index) => {
            let playerEl = document.querySelector(`.player-item[data-id="${player.uid}"]`);
            const rank = index + 1;

            if (!playerEl) {
                playerEl = document.createElement('div');
                playerEl.dataset.id = player.uid;
                playerEl.classList.add('player-item');
            }
            
            playerEl.classList.remove('place-1', 'place-2', 'place-3', 'list-item', 'podium-item');
            playerEl.querySelector('.crown')?.remove();

            if (rank <= 3) {
                playerEl.classList.add('podium-item', `place-${rank}`);
                const crown = rank === 1 ? `<div class="crown"><svg viewBox="0 0 24 24"><path d="M12 2L9.5 7.5L4 8.5L8.5 12.5L7 18L12 15L17 18L15.5 12.5L20 8.5L14.5 7.5L12 2Z"></path></svg></div>` : '';
                playerEl.innerHTML = `${crown}<div class="player-icon"><img src="${player.avatar}" alt="${player.name}"></div><div class="player-name">${player.name}</div><div class="player-score">${player.score} pts</div>`;
                podiumContainer.appendChild(playerEl);
            } else {
                playerEl.classList.add('list-item');
                playerEl.innerHTML = `<span class="rank">${rank}</span><div class="player-icon small"><img src="${player.avatar}" alt="${player.name}"></div><span class="name">${player.name}</span><span class="score">${player.score} pts</span>`;
                listContainer.appendChild(playerEl);
            }
        });
    });
    store.unsubscribeListeners.push(unsubscribe);
}

export function loadAttemptsForQuiz(quizId) {
    const attemptsContainer = document.querySelector('#attempts-list');
    const q = query(collection(db, 'quizAttempts'), where("quizId", "==", quizId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let html = '<h3>Tentativas dos Alunos</h3>';
        if (snapshot.empty) {
            html += '<p>Nenhum aluno iniciou este quiz ainda.</p>';
        } else {
            html += '<ul>' + snapshot.docs.map(doc => {
                const attempt = doc.data();
                return `<li>${attempt.studentEmail} - Status: ${attempt.status} ${attempt.totalScore !== null ? `- Pontuação: ${attempt.totalScore}` : ''}</li>`;
            }).join('') + '</ul>';
        }
        if(attemptsContainer) attemptsContainer.innerHTML = html;
    });
    store.unsubscribeListeners.push(unsubscribe);
}

// CORREÇÃO: As funções de 'update DOM' precisam de ser exportadas.
export function updateQuestionsFromDOM() {
    const questions = store.currentQuiz.questions || [];
    document.querySelectorAll('.question-card').forEach((card, index) => {
        const type = card.dataset.type;
        const questionData = {
            type,
            text: card.querySelector('textarea[name="text"]').value,
            imageUrl: card.querySelector('input[name="imageUrl"]').value,
            weight: parseInt(card.querySelector('input[name="weight"]').value, 10) || 1,
            timeLimit: parseInt(card.querySelector('input[name="timeLimit"]').value, 10) || 30,
        };

        if (type === 'multiple-choice') {
            questionData.options = Array.from(card.querySelectorAll('input[name="option"]')).map(i => i.value);
            questionData.correctAnswerIndex = parseInt(card.querySelector(`input[name="correct-answer-${index}"]:checked`).value, 10);
        } else {
            questionData.htmlCorrect = card.querySelector('textarea[name="htmlCorrect"]').value;
            questionData.cssCorrect = card.querySelector('textarea[name="cssCorrect"]').value;
            questionData.jsCorrect = card.querySelector('textarea[name="jsCorrect"]').value;
        }
        questions.push(questionData);
    });
    return questions;
}

export function attachQuestionEditorListeners() {
    const form = document.querySelector('#question-editor-form');
    if (!form) return;

    const optionsContainer = form.querySelector('#options-container');
    if (!optionsContainer) return; // Só anexa se o container de opções existir
    
    form.addEventListener('click', (e) => {
        if (e.target.matches('#add-option-btn-editor')) {
            const newOption = document.createElement('div');
            newOption.className = 'option-group';
            const newIndex = optionsContainer.children.length;
            newOption.innerHTML = `
                <input type="radio" name="correct-answer" value="${newIndex}" required>
                <input type="text" name="option" class="form-control" required>
                <button type="button" class="btn-icon remove-option-btn">&times;</button>
            `;
            optionsContainer.appendChild(newOption);
        }
        if (e.target.matches('.remove-option-btn')) {
            if (optionsContainer.children.length > 2) {
                e.target.closest('.option-group').remove();
            } else {
                alert("São necessárias pelo menos 2 alternativas.");
            }
        }
    });
}

export function updateSingleQuestionFromDOM() {
    const form = document.querySelector('#question-editor-form');
    const type = form.dataset.type;
    
    const data = {
        id: store.currentQuestion?.id,
        creatorId: store.user.uid,
        text: form.elements.text.value,
        imageUrl: form.elements.imageUrl.value,
        weight: parseInt(form.elements.weight.value, 10) || 1,
        timeLimit: parseInt(form.elements.timeLimit.value, 10) || 30,
        tags: form.elements.tags.value.split(',').map(t => t.trim()).filter(Boolean),
        type: type
    };
    
    if (type === 'multiple-choice') {
        data.options = Array.from(form.querySelectorAll('input[name="option"]')).map(i => i.value);
        const checkedRadio = form.querySelector('input[name="correct-answer"]:checked');
        if (!checkedRadio) {
            alert("Por favor, marque uma resposta como correta.");
            throw new Error("Resposta correta não selecionada.");
        }
        data.correctAnswerIndex = parseInt(checkedRadio.value, 10);
    } else if (type === 'coding') {
        data.htmlCorrect = form.elements.htmlCorrect.value;
        data.cssCorrect = form.elements.cssCorrect.value;
        data.jsCorrect = form.elements.jsCorrect.value;
    }
    return data;
}

export async function showGradesReport() {
    showLoading("A carregar relatório de notas...");
    
    const classesQuery = query(collection(db, 'classes'), where("teacherId", "==", store.user.uid));
    const studentsQuery = query(collection(db, 'users'), where("role", "==", "student"));
    const quizzesQuery = query(collection(db, 'quizzes'), where("creatorId", "==", store.user.uid));
    const attemptsQuery = query(collection(db, 'quizAttempts'), where("teacherId", "==", store.user.uid), where("status", "==", "completed"));

    try {
        const [classesSnap, studentsSnap, quizzesSnap, attemptsSnap] = await Promise.all([
            getDocs(classesQuery),
            getDocs(studentsQuery),
            getDocs(quizzesQuery),
            getDocs(attemptsQuery)
        ]);

        store.allClasses = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        store.allStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        store.quizzes = quizzesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        store.allAttempts = attemptsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        render(GradesReportView(store.allClasses, store.allStudents, store.quizzes, store.allAttempts));
    } catch (error) {
        console.error("Erro ao carregar dados para o relatório:", error);
        alert("Ocorreu um erro ao carregar o relatório de notas.");
    }
}

export function attachGradesReportListeners() {
    const filters = {
        class: document.querySelector('#class-filter'),
        student: document.querySelector('#student-filter'),
        quiz: document.querySelector('#quiz-filter'),
    };
    const tableBody = document.querySelector('#grades-table-body');
    const exportBtn = document.querySelector('#export-csv-btn');
    const tabs = document.querySelector('.tabs');
    
    let chartInstances = {};
    let filteredData = store.allAttempts || [];

    const destroyCharts = () => {
        Object.values(chartInstances).forEach(chart => chart.destroy());
        chartInstances = {};
    };

    const renderCharts = () => {
        destroyCharts();
        renderQuestionAnalysisChart();
        renderStudentHistoryChart();
        renderClassComparisonChart();
    };

    const updateStudentFilter = (classId) => {
        const studentFilter = filters.student;
        const currentStudentId = studentFilter.value;
        let studentOptions = '<option value="">Todos os Alunos</option>';

        let studentsToShow = store.allStudents;
        if (classId) {
            const selectedClass = store.allClasses.find(c => c.id === classId);
            const studentIdsInClass = selectedClass.students.map(s => s.uid);
            studentsToShow = store.allStudents.filter(s => studentIdsInClass.includes(s.id));
        }

        studentsToShow.forEach(s => {
            studentOptions += `<option value="${s.id}">${s.name}</option>`;
        });
        
        studentFilter.innerHTML = studentOptions;
        studentFilter.value = currentStudentId; // Mantém a seleção se o aluno ainda estiver na lista
    };

    const applyFilters = () => {
        const classId = filters.class.value;
        const studentId = filters.student.value;
        const quizId = filters.quiz.value;
        
        filteredData = store.allAttempts.filter(attempt => {
            const quiz = store.quizzes.find(q => q.id === attempt.quizId);
            const classMatch = !classId || (quiz && quiz.classId === classId);
            const studentMatch = !studentId || attempt.studentId === studentId;
            const quizMatch = !quizId || attempt.quizId === quizId;
            return classMatch && studentMatch && quizMatch;
        });
        
        renderGradesTable(filteredData);
        renderCharts();
    };

    const renderGradesTable = (data) => {
        if (!tableBody) return;
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhum resultado encontrado para os filtros selecionados.</td></tr>';
        } else {
            tableBody.innerHTML = data.map(attempt => {
                const student = store.allStudents.find(s => s.id === attempt.studentId);
                const quiz = store.quizzes.find(q => q.id === attempt.quizId);
                const aClass = store.allClasses.find(c => c.id === quiz?.classId);
                return `
                <tr>
                    <td>${student?.name || attempt.studentEmail}</td>
                    <td>${aClass?.className || 'N/A'}</td>
                    <td>${attempt.quizTitle}</td>
                    <td>${attempt.finalGrade || 'N/A'}</td>
                    <td>${attempt.totalScore}</td>
                </tr>
            `}).join('');
        }
    };
    
    const renderQuestionAnalysisChart = () => {
        const quizId = filters.quiz.value;
        const container = document.querySelector('#question-analysis-container');
        if (!container) return;

        if (!quizId) {
            container.innerHTML = '<p>Selecione uma atividade no filtro acima para ver a análise por questão.</p>';
            return;
        }
        container.innerHTML = '<canvas id="question-analysis-chart"></canvas>';

        const selectedQuiz = store.quizzes.find(q => q.id === quizId);
        const attemptsForQuiz = store.allAttempts.filter(a => a.quizId === quizId);
        const questionStats = selectedQuiz.questions.map((q, index) => {
            const totalAttempts = attemptsForQuiz.length;
            let totalScore = 0;
            attemptsForQuiz.forEach(att => {
                const answer = att.answers.find(a => a.questionIndex === index);
                if(answer) {
                    if(answer.isCorrect) totalScore += 10;
                    else if(answer.manualGrade !== undefined) totalScore += answer.manualGrade;
                }
            });
            return totalAttempts > 0 ? (totalScore / totalAttempts) : 0;
        });

        chartInstances.questionAnalysis = new Chart(document.getElementById('question-analysis-chart'), {
            type: 'bar',
            data: {
                labels: selectedQuiz.questions.map((q, i) => `Questão ${i + 1}`),
                datasets: [{
                    label: 'Nota Média (0-10)',
                    data: questionStats,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true, max: 10 } } }
        });
    };

    const renderStudentHistoryChart = () => {
        const studentId = filters.student.value;
        const container = document.querySelector('#student-history-container');
        if (!container) return;

        if (!studentId) {
            container.innerHTML = '<p>Selecione um aluno para ver o seu histórico de notas.</p>';
            return;
        }
        container.innerHTML = '<canvas id="student-history-chart"></canvas>';

        const attemptsForStudent = store.allAttempts
            .filter(a => a.studentId === studentId)
            .sort((a, b) => a.completedAt.seconds - b.completedAt.seconds);

        chartInstances.studentHistory = new Chart(document.getElementById('student-history-chart'), {
            type: 'line',
            data: {
                labels: attemptsForStudent.map(a => a.quizTitle),
                datasets: [{
                    label: 'Nota do Aluno',
                    data: attemptsForStudent.map(a => a.finalGrade),
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: { scales: { y: { beginAtZero: true, max: 2.5 } } }
        });
    };

    const renderClassComparisonChart = () => {
        const container = document.querySelector('#class-comparison-container');
        if (!container) return;
        container.innerHTML = '<canvas id="class-comparison-chart"></canvas>';

        const classAverages = store.allClasses.map(c => {
            const attemptsForClass = store.allAttempts.filter(att => {
                const quiz = store.quizzes.find(q => q.id === att.quizId);
                return quiz && quiz.classId === c.id;
            });
            const totalGrade = attemptsForClass.reduce((sum, att) => sum + parseFloat(att.finalGrade || 0), 0);
            return attemptsForClass.length > 0 ? totalGrade / attemptsForClass.length : 0;
        });

        chartInstances.classComparison = new Chart(document.getElementById('class-comparison-chart'), {
            type: 'bar',
            data: {
                labels: store.allClasses.map(c => c.className),
                datasets: [{
                    label: 'Nota Média da Turma',
                    data: classAverages,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true, max: 2.5 } } }
        });
    };

    tabs.addEventListener('click', (e) => {
        const target = e.target.closest('.tab-link');
        if (!target) return;

        document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        target.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(target.dataset.tab).classList.add('active');
    });

    filters.class.addEventListener('change', () => {
        updateStudentFilter(filters.class.value);
        applyFilters();
    });
    filters.student.addEventListener('change', applyFilters);
    filters.quiz.addEventListener('change', applyFilters);
    
    exportBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Aluno,Turma,Atividade,Nota,Pontuação\r\n";

        filteredData.forEach(attempt => {
            const student = store.allStudents.find(s => s.id === attempt.studentId);
            const quiz = store.quizzes.find(q => q.id === attempt.quizId);
            const aClass = store.allClasses.find(c => c.id === quiz?.classId);
            
            const row = [
                `"${student?.name || attempt.studentEmail}"`,
                `"${aClass?.className || 'N/A'}"`,
                `"${attempt.quizTitle}"`,
                attempt.finalGrade || 'N/A',
                attempt.totalScore
            ].join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_de_notas.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    });

    function initialize() {
        if (typeof Chart === 'undefined') {
            setTimeout(initialize, 100);
        } else {
            Chart.defaults.color = '#d1d5db';
            Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
            applyFilters();
        }
    }
    initialize();
}
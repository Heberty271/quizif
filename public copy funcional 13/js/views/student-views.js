//================================================================
// FILE: js/views/student-views.js (COMPLETO E FINAL)
//================================================================

import { render, showLoading } from '../main.js';
import { store } from '../store.js';
import { db } from '../api/firebase.js';
import { collection, query, where, onSnapshot, getDoc, getDocs, doc, updateDoc, increment, serverTimestamp, deleteField } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import * as AI from '../api/ai.js'; 
import * as BadgeAPI from '../api/badges.js';

// Importa os templates HTML
import { StudentDashboardView } from './StudentDashboard.js';
import { QuizAttemptView } from './QuizAttemptView.js';
import { ResultsView } from './ResultsView.js';
import { AttemptReviewView } from './AttemptReviewView.js';
import { ProfileView } from './ProfileView.js';

export function showStudentDashboard() {
    showLoading();
    const q = query(collection(db, 'quizAttempts'), where("studentId", "==", store.user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allAttempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingOrInProgress = allAttempts.filter(a => a.status === 'pending' || a.status === 'in-progress');
        const completed = allAttempts.filter(a => a.status === 'completed');
        render(StudentDashboardView(store.userData, pendingOrInProgress, completed));
    });
    
    store.unsubscribeListeners.push(unsubscribe);
}

export async function showStudentProfile() {
    showLoading("A carregar perfil...");
    
    const userRef = doc(db, 'users', store.user.uid);
    const attemptsQuery = query(collection(db, 'quizAttempts'), where("studentId", "==", store.user.uid), where("status", "==", "completed"));

    try {
        const [userSnap, attemptsSnap] = await Promise.all([
            getDoc(userRef),
            getDocs(attemptsQuery)
        ]);
        
        const userData = userSnap.data();
        store.userData = userData; // Atualiza o store local

        const completedAttempts = attemptsSnap.docs.map(d => d.data());

        render(ProfileView(userData, completedAttempts));

    } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        alert("Não foi possível carregar o perfil.");
        window.location.hash = '#student/dashboard';
    }
}

export async function showQuizAttempt(params) {
    showLoading("A carregar avaliação...");
    const attemptId = params.id;
    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);

    if (!attemptSnap.exists() || attemptSnap.data().studentId !== store.user.uid) {
        alert("Avaliação não encontrada ou não autorizada.");
        window.location.hash = '#student/dashboard';
        return;
    }
    store.currentAttempt = { id: attemptSnap.id, ...attemptSnap.data() };

    if (store.currentAttempt.status === 'completed') {
        alert("Já finalizou esta avaliação.");
        const completedQuizSnap = await getDoc(doc(db, 'quizzes', store.currentAttempt.quizId));
        store.currentQuiz = { id: completedQuizSnap.id, ...completedQuizSnap.data() };
        render(ResultsView(store.currentQuiz, store.currentAttempt)); 
        loadFinalLeaderboard(store.currentAttempt.quizId);
        return;
    }

    const quizRef = doc(db, 'quizzes', store.currentAttempt.quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) {
        alert("Erro: O quiz desta avaliação não foi encontrado.");
        window.location.hash = '#student/dashboard';
        return;
    }
    store.currentQuiz = { id: quizSnap.id, ...quizSnap.data() };

    if (store.currentAttempt.status === 'pending') {
        await updateDoc(attemptRef, { 
            status: 'in-progress', 
            startedAt: serverTimestamp(),
            totalScore: 0,
            correctCount: 0,
            incorrectCount: 0,
        });
        store.currentAttempt.totalScore = 0;
        store.currentAttempt.correctCount = 0;
        store.currentAttempt.incorrectCount = 0;
    }

    render(QuizAttemptView(store.currentQuiz, store.currentAttempt));
}

export function attachQuizAttemptListeners() {
    if (!store.currentAttempt || !store.currentQuiz) return;
    
    let { questionOrder, optionOrders, questionStartedAt } = store.currentAttempt;
    if (typeof optionOrders === 'string') {
        optionOrders = JSON.parse(optionOrders);
    }

    let currentShuffledIndex = store.currentAttempt.currentQuestionIndex || 0;
    const questions = store.currentQuiz.questions;
    const attemptId = store.currentAttempt.id;
    let studentAnswers = store.currentAttempt.answers || [];
    let timerId = null;
    let autoSaveInterval = null;
    let streak = 0;

    startLiveLeaderboard(store.currentAttempt.quizId);

    const logToCustomConsole = (args, type = 'log') => {
        const customConsole = document.querySelector('#custom-console-output');
        if (!customConsole) return;
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        
        const serializedMessage = args.map(arg => {
            if (arg instanceof Error) return arg.message;
            if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg, null, 2);
            return String(arg);
        }).join(' ');

        logEntry.textContent = `> ${serializedMessage}`;
        customConsole.appendChild(logEntry);
        customConsole.scrollTop = customConsole.scrollHeight;
    };
    
    const messageHandler = (event) => {
        const { type, method, args } = event.data;
        if (type === 'console') {
            logToCustomConsole(args, method);
        }
    };
    window.addEventListener('message', messageHandler);
    store.unsubscribeListeners.push(() => window.removeEventListener('message', messageHandler));

    const updatePreview = () => {
        const customConsole = document.querySelector('#custom-console-output');
        if(customConsole) customConsole.innerHTML = '';
        
        const htmlCode = document.querySelector('#html-editor')?.value ?? '';
        const cssCode = document.querySelector('#css-editor')?.value ?? '';
        const jsCode = document.querySelector('#js-editor')?.value ?? '';
        const iframe = document.querySelector('#preview-frame');
        
        if (iframe) {
            const consoleInterceptor = `<script>
                    const postLog = (method, args) => window.parent.postMessage({ type: 'console', method, args: [...args] }, '*');
                    window.console.log = (...args) => postLog('log', args);
                    window.console.error = (...args) => postLog('error', args);
                    window.console.warn = (...args) => postLog('warn', args);
                    window.console.info = (...args) => postLog('info', args);
                    window.addEventListener('error', (e) => postLog('error', [e.message]));
                <\/script>`;
            const iframeContent = `<!DOCTYPE html><html><head>${consoleInterceptor}<style>${cssCode}</style></head><body>${htmlCode}<script>try { ${jsCode} } catch(e) { console.error(e.message) }<\/script></body></html>`;
            iframe.srcdoc = iframeContent;
        }
    };
    
    const startTimer = (timeLimit, startTime) => {
        clearInterval(timerId);
        
        const elapsed = startTime ? (Date.now() - startTime.toDate().getTime()) / 1000 : 0;
        let timeLeft = Math.max(0, timeLimit - elapsed);

        const timerCircle = document.querySelector('#timer-circle-text');
        const timerIconEl = document.querySelector('#timer-icon');
        const clockIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>`;
        const fireIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.76-.36 3.6 0 3.6 0s-1.87 1.02-1.87 2.81c0 1.68 1.79 3.45 1.79 3.45s-1.35 1.45-3.11 1.45z"></path></svg>`;
        
        timerId = setInterval(() => {
            timeLeft--;
            if (timerCircle) timerCircle.textContent = Math.round(timeLeft);

            if (timeLeft <= 10) {
                timerCircle?.parentElement.classList.add('urgent');
                if(timerIconEl) timerIconEl.innerHTML = fireIcon;
            } else {
                timerCircle?.parentElement.classList.remove('urgent');
                if(timerIconEl) timerIconEl.innerHTML = clockIcon;
            }

            if (timeLeft < 0) {
                handleAnswer(null, true); 
            }
        }, 1000);
        
        if (timerCircle) timerCircle.textContent = Math.round(timeLeft);
        if(timerIconEl) timerIconEl.innerHTML = clockIcon;
        timerCircle?.parentElement.classList.remove('urgent');
    };
    
    const handleAnswer = async (chosenOriginalOptionIndex, timeOut = false) => {
        clearInterval(timerId);
        
        const originalQuestionIndex = questionOrder[currentShuffledIndex];
        const question = questions[originalQuestionIndex];
        
        const isCorrect = !timeOut && chosenOriginalOptionIndex === question.correctAnswerIndex;
        let gamePoints = 0;
        let correctCountInc = isCorrect ? 1 : 0;
        let incorrectCountInc = isCorrect ? 0 : 1;
        
        const timerCircle = document.querySelector('#timer-circle-text');
        const timeLeft = timerCircle ? parseInt(timerCircle.textContent, 10) : 0;
        const timeLimit = question.timeLimit || 20;
        const timeTaken = timeLimit - timeLeft;

        if (isCorrect) {
            streak++;
            if (streak === 3) {
                const awarded = await BadgeAPI.awardBadge(store.user.uid, 'hat_trick');
                if (awarded) alert("Conquista Desbloqueada: Hat-Trick!");
            }
            if (streak === 5) {
                const awarded = await BadgeAPI.awardBadge(store.user.uid, 'unstoppable');
                if (awarded) alert("Conquista Desbloqueada: Imparável!");
            }
            if (timeTaken < 5) {
                const awarded = await BadgeAPI.awardBadge(store.user.uid, 'speed_demon');
                if (awarded) alert("Conquista Desbloqueada: Demônio da Velocidade!");
            }
            if (timeLeft <= 3) {
                 const awarded = await BadgeAPI.awardBadge(store.user.uid, 'under_pressure');
                if (awarded) alert("Conquista Desbloqueada: Sob Pressão!");
            }
            
            const timeRatio = Math.max(0, timeLeft / timeLimit);
            gamePoints = 500 + Math.floor(500 * timeRatio);
        } else {
            streak = 0;
        }

        studentAnswers[currentShuffledIndex] = {
            questionIndex: originalQuestionIndex,
            answerIndex: chosenOriginalOptionIndex,
            pointsForGrade: isCorrect ? (1000 * (question.weight || 1)) : 0,
            isCorrect: isCorrect,
            gamePoints: gamePoints
        };
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = true;
            const btnIndex = parseInt(btn.dataset.originalIndex);
            if (btnIndex === question.correctAnswerIndex) btn.classList.add('correct');
            if (btnIndex === chosenOriginalOptionIndex && !isCorrect) btn.classList.add('incorrect');
        });
        
        const feedbackBanner = document.querySelector('#feedback-banner');
        if (timeOut) {
            if (question.type === 'multiple-choice') {
                feedbackBanner.textContent = `Tempo esgotado! A resposta correta era: ${question.options[question.correctAnswerIndex]}`;
            } else {
                feedbackBanner.textContent = `Tempo esgotado!`;
            }
            feedbackBanner.className = 'feedback-banner incorrect';
        } else if (isCorrect) {
            feedbackBanner.textContent = 'Resposta Correta!';
            feedbackBanner.className = 'feedback-banner correct';
        } else {
            feedbackBanner.textContent = `Incorreto! A resposta correta era: ${question.options[question.correctAnswerIndex]}`;
            feedbackBanner.className = 'feedback-banner incorrect';
        }
        feedbackBanner.style.display = 'block';
        document.querySelector('#next-question-button-container').style.display = 'flex';

        await updateDoc(doc(db, 'quizAttempts', attemptId), {
            answers: studentAnswers,
            totalScore: increment(gamePoints),
            correctCount: increment(correctCountInc),
            incorrectCount: increment(incorrectCountInc),
            questionStartedAt: null
        });
    };
    
    const handleNextQuestion = async () => {
        clearInterval(autoSaveInterval);
        const originalQuestionIndex = questionOrder[currentShuffledIndex];
        const question = questions[originalQuestionIndex];
        
        if (question.type === 'coding') {
            studentAnswers[currentShuffledIndex] = {
                questionIndex: originalQuestionIndex,
                type: 'coding',
                html: document.querySelector('#html-editor')?.value ?? '',
                css: document.querySelector('#css-editor')?.value ?? '',
                js: document.querySelector('#js-editor')?.value ?? '',
            };
            const draftKey = `draftAnswers.${originalQuestionIndex}`;
             await updateDoc(doc(db, 'quizAttempts', attemptId), {
                [draftKey]: deleteField()
            });
        }
        
        currentShuffledIndex++;
        await updateDoc(doc(db, 'quizAttempts', attemptId), { 
            answers: studentAnswers, 
            currentQuestionIndex: currentShuffledIndex 
        });
        displayQuestion();
    };
    
    const handleFinishQuiz = async () => {
        clearInterval(timerId);
        clearInterval(autoSaveInterval);
        if (!confirm("Tem a certeza que deseja finalizar a avaliação?")) return;
        
        if(currentShuffledIndex < questions.length) {
            const question = questions[questionOrder[currentShuffledIndex]];
            let answerData = { questionIndex: questionOrder[currentShuffledIndex] };
            if (question.type === 'coding') {
                answerData.type = 'coding';
                answerData.html = document.querySelector('#html-editor')?.value ?? '';
                answerData.css = document.querySelector('#css-editor')?.value ?? '';
                answerData.js = document.querySelector('#js-editor')?.value ?? null;
            } else {
                answerData.type = 'multiple-choice';
                answerData.answerIndex = null;
                answerData.isCorrect = false;
                answerData.pointsForGrade = 0;
                answerData.gamePoints = 0;
            }
            studentAnswers[currentShuffledIndex] = answerData;
        }
        
        showLoading("A Corrigir a sua prova com a IA...");
        
        for (let i = 0; i < studentAnswers.length; i++) {
            const answer = studentAnswers[i];
            const question = questions[answer.questionIndex];
            
            if (question.type === 'coding') {
                const studentCode = { html: answer.html, css: answer.css, js: answer.js };
                const correctCode = { html: question.htmlCorrect, css: question.cssCorrect, js: question.jsCorrect };
                
                try {
                    const aiResult = await AI.gradeCodeWithAI(question.text, correctCode, studentCode);
                    answer.manualGrade = aiResult.grade;
                    answer.feedback = aiResult.feedback;
                    answer.gamePoints = (aiResult.grade / 10) * 1000 * (question.weight || 1);
                } catch (e) {
                    console.error("Erro na correção por IA:", e);
                    answer.manualGrade = 0;
                    answer.feedback = "Ocorreu um erro ao corrigir esta questão com a IA.";
                    answer.gamePoints = 0;
                }
            }
        }

        const finalScore = calculateScore(studentAnswers);
        const finalGrade = calculateGrade(studentAnswers, questions, store.currentQuiz.totalValue);
        
        try {
            await updateDoc(doc(db, 'quizAttempts', attemptId), {
                status: 'completed',
                completedAt: serverTimestamp(),
                totalScore: finalScore,
                finalGrade: finalGrade,
                answers: studentAnswers,
                draftAnswers: deleteField()
            });
            
            const newBadges = await BadgeAPI.checkAndAwardBadges(store.user.uid, attemptId, store.currentQuiz.id);
            if (newBadges.length > 0) {
                const badgeNames = newBadges.map(b => b.name).join(', ');
                setTimeout(() => alert(`Parabéns! Desbloqueou novas conquistas: ${badgeNames}`), 1000);
            }

            store.currentAttempt.totalScore = finalScore;
            store.currentAttempt.finalGrade = finalGrade;
            
            setTimeout(() => {
                render(ResultsView(store.currentQuiz, store.currentAttempt));
                loadFinalLeaderboard(store.currentAttempt.quizId);
            }, 100);
        } catch (error) {
             console.error("Error finishing quiz:", error);
             alert("Ocorreu um erro ao finalizar a avaliação. Tente novamente.");
             window.location.hash = '#student/dashboard';
        }
    };
    
    const displayQuestion = async () => {
        const mainPanel = document.querySelector('.quiz-main-panel');
        if (!mainPanel) return;
        if (currentShuffledIndex >= questionOrder.length) {
            handleFinishQuiz();
            return;
        }

        clearInterval(autoSaveInterval);

        const originalQuestionIndex = questionOrder[currentShuffledIndex];
        const question = questions[originalQuestionIndex];
        
        if (!question) {
            console.warn(`Questão com índice ${originalQuestionIndex} não encontrada. Pulando.`);
            currentShuffledIndex++;
            await updateDoc(doc(db, 'quizAttempts', attemptId), { currentQuestionIndex });
            displayQuestion();
            return;
        }
        
        document.querySelector('#score-value').textContent = store.currentAttempt.totalScore || 0;
        document.querySelector('#correct-value').textContent = store.currentAttempt.correctCount || 0;
        document.querySelector('#incorrect-value').textContent = store.currentAttempt.incorrectCount || 0;
        document.querySelector('#question-progress-bar-inner').style.width = `${((currentShuffledIndex + 1) / questionOrder.length) * 100}%`;
        document.querySelector('#question-progress-text').textContent = `Pergunta ${currentShuffledIndex + 1} de ${questionOrder.length}`;

        let questionImageHTML = question.imageUrl ? `<div class="question-image-container"><img src="${question.imageUrl}" alt="Imagem da questão" onerror="this.style.display='none'"></div>` : '';
        let optionsHTML = '';
        let nextButtonContainerHTML = `<div id="next-question-button-container" style="display: none;"><button id="next-question-btn" class="btn btn-primary">Próxima Pergunta</button></div>`;

        if (question.type === 'multiple-choice') {
            const currentOptionOrder = optionOrders[originalQuestionIndex];
            optionsHTML = `<div class="answers-grid">` + currentOptionOrder.map(optIndex => `<button class="answer-btn" data-original-index="${optIndex}">${question.options[optIndex]}</button>`).join('') + `</div>`;
        } else if (question.type === 'coding') {
            const showHTML = `<div class="editor-pane"><label>HTML</label><div class="code-editor-wrapper"><textarea id="html-editor" class="code-editor" spellcheck="false"></textarea><pre id="html-highlight-area" class="code-highlight-area" aria-hidden="true"><code class="language-html"></code></pre></div></div>`;
            const showCSS = `<div class="editor-pane"><label>CSS</label><div class="code-editor-wrapper"><textarea id="css-editor" class="code-editor" spellcheck="false"></textarea><pre id="css-highlight-area" class="code-highlight-area" aria-hidden="true"><code class="language-css"></code></pre></div></div>`;
            const showJS = `<div class="editor-pane"><label>JS</label><div class="code-editor-wrapper"><textarea id="js-editor" class="code-editor" spellcheck="false"></textarea><pre id="js-highlight-area" class="code-highlight-area" aria-hidden="true"><code class="language-javascript"></code></pre></div></div>`;

            let editors = '';
            const yearLevel = parseInt(store.currentQuiz.yearLevel, 10);
            if (yearLevel === 1) editors = showHTML + showCSS;
            else if (yearLevel === 2) editors = showHTML + showJS;
            else editors = showHTML + showCSS + showJS;

            const consoleDisplay = yearLevel >= 2 ? 'flex' : 'none';
            optionsHTML = `<div class="code-editor-layout"><div class="code-editors-wrapper">${editors}</div><div class="preview-and-console"><div class="preview-pane"><div class="preview-controls"><button type="button" id="run-code-btn" class="btn btn-secondary btn-inline">Atualizar</button><button id="maximize-preview-btn" class="btn-icon" title="Maximizar"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-4V5h3v2h-3z"></path></svg></button><button id="restore-preview-btn" class="btn-icon" title="Restaurar" style="display:none;"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 4h3v3h-2V5h-3V3h2V1h-4v4h-2V3H7v2H5v2H3v4h2V7h3v2h4V7h3v2h2V7zM7 19h2v2h4v-2h3v2h2v-2h2v-4h-2v2h-3v-2H9v2H7v-2H5v4h2z"></path></svg></button></div><iframe id="preview-frame"></iframe></div><div id="custom-console" style="display: ${consoleDisplay};"><div class="console-header">Console</div><div id="custom-console-output"></div></div></div></div>`;
            nextButtonContainerHTML = `<div id="next-question-button-container" style="display: flex;"><button id="next-question-btn" class="btn btn-primary">Próxima Pergunta</button></div>`;
        }

        mainPanel.innerHTML = `
            <div class="question-content-wrapper">
                <h2>${store.currentQuiz.title}</h2>
                <p>${store.currentQuiz.description || ''}</p>
                ${questionImageHTML}
                <h3 class="question-text">${question.text.replace(/\n/g, '<br>')}</h3>
                <div id="options-area">${optionsHTML}</div>
                <div id="feedback-banner" class="feedback-banner" style="display: none;"></div>
                ${nextButtonContainerHTML}
            </div>`;
        
        mainPanel.querySelector('#next-question-btn')?.addEventListener('click', handleNextQuestion);
        document.querySelectorAll('.answer-btn').forEach(btn => btn.addEventListener('click', (e) => handleAnswer(parseInt(e.currentTarget.dataset.originalIndex, 10), false)));
        
        if (question.type === 'coding') {
            const draft = store.currentAttempt.draftAnswers?.[originalQuestionIndex];
            
            const setupEditor = (type) => {
                const textarea = document.querySelector(`#${type}-editor`);
                const highlightEl = document.querySelector(`#${type}-highlight-area code`);
                if (!textarea || !highlightEl) return;
                
                const savedCode = draft?.[type] ?? studentAnswers[currentShuffledIndex]?.[type] ?? question[`template${type.toUpperCase()}`];
                textarea.value = savedCode;
                highlightEl.textContent = savedCode;
                Prism.highlightElement(highlightEl);

                textarea.addEventListener('input', () => {
                    highlightEl.textContent = textarea.value;
                    Prism.highlightElement(highlightEl);
                });
                textarea.addEventListener('scroll', () => {
                    highlightEl.parentElement.scrollTop = textarea.scrollTop;
                    highlightEl.parentElement.scrollLeft = textarea.scrollLeft;
                });
                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
                        textarea.selectionStart = textarea.selectionEnd = start + 2;
                        highlightEl.textContent = textarea.value;
                        Prism.highlightElement(highlightEl);
                    }
                });
            };

            ['html', 'css', 'js'].forEach(setupEditor);
            
            document.querySelector('#run-code-btn').addEventListener('click', updatePreview);
            const previewAndConsole = mainPanel.querySelector('.preview-and-console');
            mainPanel.querySelector('#maximize-preview-btn')?.addEventListener('click', () => previewAndConsole.classList.add('maximized'));
            mainPanel.querySelector('#restore-preview-btn')?.addEventListener('click', () => previewAndConsole.classList.remove('maximized'));
            
            autoSaveInterval = setInterval(async () => {
                const statusEl = document.querySelector('#auto-save-status');
                if(statusEl) statusEl.textContent = "A guardar...";
                const currentDraft = {
                    html: document.querySelector('#html-editor')?.value,
                    css: document.querySelector('#css-editor')?.value,
                    js: document.querySelector('#js-editor')?.value ?? null,
                };
                Object.keys(currentDraft).forEach(key => currentDraft[key] === undefined && delete currentDraft[key]);
                
                const updateData = { [`draftAnswers.${originalQuestionIndex}`]: currentDraft };
                await updateDoc(doc(db, 'quizAttempts', attemptId), updateData);
                if(statusEl) statusEl.textContent = "Guardado ✓";
            }, 10000); 
            
            store.unsubscribeListeners.push(() => clearInterval(autoSaveInterval));
            
            updatePreview();
        }
        
        let attemptData = store.currentAttempt;
        if (!attemptData.questionStartedAt) {
            await updateDoc(doc(db, 'quizAttempts', attemptId), { questionStartedAt: serverTimestamp() });
            const updatedAttemptSnap = await getDoc(doc(db, 'quizAttempts', attemptId));
            questionStartedAt = updatedAttemptSnap.data().questionStartedAt;
        } else {
            questionStartedAt = attemptData.questionStartedAt;
        }
        
        startTimer(question.timeLimit || 20, questionStartedAt);
    };
    
    document.querySelector('#finish-quiz-btn')?.addEventListener('click', handleFinishQuiz);

    displayQuestion();
}

export async function showStudentAttemptReview(params) {
    showLoading("A carregar a sua revisão...");
    const attemptId = params.id;
    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);

    if (!attemptSnap.exists() || attemptSnap.data().studentId !== store.user.uid) {
        alert("Avaliação não encontrada ou não autorizada.");
        window.location.hash = '#student/dashboard';
        return;
    }

    const attempt = {id: attemptSnap.id, ...attemptSnap.data()};
    const quizRef = doc(db, 'quizzes', attempt.quizId);
    const quizSnap = await getDoc(quizRef);

    if (!quizSnap.exists()) {
        alert("Erro: O quiz correspondente a esta avaliação não foi encontrado.");
        window.location.hash = '#student/dashboard';
        return;
    }

    const quiz = {id: quizSnap.id, ...quizSnap.data()};
    render(AttemptReviewView(quiz, attempt, quiz.yearLevel));
}

export function attachStudentAttemptReviewListeners() {
    document.querySelectorAll('.preview-pane iframe').forEach((iframe) => {
        const html = iframe.dataset.html || '';
        const css = iframe.dataset.css || '';
        const js = iframe.dataset.js || '';
        const iframeContent = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
        iframe.srcdoc = iframeContent;
    });
}

function calculateScore(answers) {
    if (!answers) return 0;
    return answers.reduce((acc, ans) => acc + (ans.gamePoints || 0), 0);
}

function calculateGrade(answers, questions, totalQuizValue) {
    if (!questions || questions.length === 0 || !answers) return 0;
    
    const totalWeight = questions.reduce((sum, q) => sum + (q.weight || 1), 0);
    if (totalWeight === 0) return totalQuizValue;

    let studentWeightedScore = 0;

    questions.forEach((q, originalIndex) => {
        const questionWeight = q.weight || 1;
        const studentAnswer = answers.find(ans => ans.questionIndex === originalIndex);
        if (studentAnswer) {
            if (q.type === 'multiple-choice' && studentAnswer.isCorrect) {
                studentWeightedScore += questionWeight * 10;
            } else if (q.type === 'coding' && studentAnswer.manualGrade !== undefined) {
                studentWeightedScore += questionWeight * studentAnswer.manualGrade;
            }
        }
    });

    const grade = (studentWeightedScore / (totalWeight * 10)) * totalQuizValue;
    return Math.min(totalQuizValue, grade).toFixed(2);
}

function startLiveLeaderboard(quizId) {
    const q = query(collection(db, 'quizAttempts'), where("quizId", "==", quizId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const attempts = snapshot.docs.map(doc => doc.data());
        const leaderboardData = attempts.map(attempt => ({
            name: attempt.studentEmail.split('@')[0],
            score: attempt.totalScore || 0,
            uid: attempt.studentId
        })).sort((a, b) => b.score - a.score);
        
        updateLeaderboardUI(leaderboardData);
    });
    store.unsubscribeListeners.push(unsubscribe);
}

function updateLeaderboardUI(leaderboardData, isFinal = false) {
    const containerId = isFinal ? '#final-leaderboard-container' : '#ranking-list';
    const container = document.querySelector(containerId);
    if (!container) return;

    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    let html = leaderboardData.map((player, index) => {
        const rank = index + 1;
        const medalHTML = rank <= 3 ? `<span class="medal-icon" style="color: ${medalColors[rank-1]};">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C11.45 2 11 2.45 11 3V5.59L8.41 4.83C7.86 4.69 7.31 5.14 7.45 5.69L8.5 10.5L4.83 13.55C4.38 13.94 4.56 14.69 5.17 14.83L10 16L12 21L14 16L18.83 14.83C19.44 14.69 19.62 13.94 19.17 13.55L15.5 10.5L16.55 5.69C16.69 5.14 16.14 4.69 15.59 4.83L13 5.59V3C13 2.45 12.55 2 12 2Z"></path></svg>
        </span>` : `<span class="rank">${rank}</span>`;
        return `
            <div class="ranking-item">
                ${medalHTML}
                <span class="name">${player.name}</span>
                <strong class="score">${player.score} pts</strong>
            </div>
        `;
    }).join('');
    container.innerHTML = html;

    const summaryEl = document.querySelector('#your-rank-summary');
    if (summaryEl) {
        const myRankIndex = leaderboardData.findIndex(p => p.uid === store.user.uid);
        if(myRankIndex > -1) {
            summaryEl.innerHTML = `Sua posição: <strong>${myRankIndex + 1}º lugar</strong> com ${leaderboardData[myRankIndex].score} pontos`;
        }
    }
}

async function loadFinalLeaderboard(quizId) {
    const q = query(collection(db, 'quizAttempts'), where("quizId", "==", quizId));
    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map(doc => doc.data());
    const leaderboardData = attempts.map(attempt => ({
        name: attempt.studentEmail.split('@')[0],
        score: attempt.totalScore ?? 0
    })).sort((a, b) => b.score - a.score);
    updateLeaderboardUI(leaderboardData, true);
}

export function attachProfileViewListeners() {
    const tabs = document.querySelector('.tabs');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabLinks = document.querySelectorAll('.tab-link');

    if (tabs) {
        tabs.addEventListener('click', (e) => {
            const target = e.target.closest('.tab-link');
            if (!target) return;

            const tabName = target.dataset.tab;

            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            tabLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            document.getElementById(tabName).classList.add('active');
            target.classList.add('active');
        });

        document.querySelector('.tab-link')?.click();
    }
}
//================================================================
// FILE: js/views/LiveQuizDashboardView.js (NOVO E COMPLETO)
// Responsabilidade: Gerar o template HTML para o painel onde o
// professor inicia e acompanha as provas ao vivo.
//================================================================

export function LiveQuizDashboardView(quizzes = []) {
    const awaitingQuizzes = quizzes.filter(q => q.status === 'awaiting');
    const liveQuizzes = quizzes.filter(q => q.status === 'live');
    const finishedQuizzes = quizzes.filter(q => q.status === 'finished');

    return `
        <header class="app-header">
            <h1>Painel de Provas</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar ao Início</a>
        </header>
        <div class="container">
            <div class="card">
                <h2>Provas Prontas para Iniciar</h2>
                ${awaitingQuizzes.length > 0 ? awaitingQuizzes.map(quiz => `
                    <div class="quiz-live-item">
                        <span>${quiz.title}</span>
                        <button class="btn btn-primary btn-inline start-live-quiz-btn" data-quiz-id="${quiz.id}">Iniciar Prova</button>
                    </div>
                `).join('') : '<p>Não há provas prontas para iniciar. Crie um novo quiz primeiro.</p>'}
            </div>

            <div class="card">
                <h2>Provas a Decorrer</h2>
                ${liveQuizzes.length > 0 ? liveQuizzes.map(quiz => `
                    <div class="quiz-live-item">
                        <span>${quiz.title}</span>
                        <a href="#live/results/${quiz.id}" class="btn btn-secondary btn-inline">Acompanhar ao Vivo</a>
                    </div>
                `).join('') : '<p>Nenhuma prova a decorrer neste momento.</p>'}
            </div>
            
            <div class="card">
                <h2>Provas Finalizadas</h2>
                 ${finishedQuizzes.length > 0 ? finishedQuizzes.map(quiz => `
                    <div class="quiz-live-item">
                        <span>${quiz.title}</span>
                         <a href="#results" class="btn btn-inline" style="background-color: #6b7280;">Ver Relatório</a>
                    </div>
                `).join('') : '<p>Nenhuma prova foi finalizada ainda.</p>'}
            </div>
        </div>
        <style>
            .quiz-live-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid #eee;
            }
            .quiz-live-item:last-child {
                border-bottom: none;
            }
            .quiz-live-item span {
                font-size: 1.1rem;
            }
        </style>
    `;
}

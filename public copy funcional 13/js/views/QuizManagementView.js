export function QuizManagementView(quizzes = []) {
    const getStatusLabel = (quiz) => {
        if (quiz.status === 'live') return '<span class="status-live">Ao Vivo</span>';
        if (quiz.status === 'homework') {
            const deadline = quiz.deadline.toDate();
            if (new Date() > deadline) {
                return '<span class="status-finished">Finalizado (Prazo Expirado)</span>';
            }
            return `<span class="status-homework">Trabalho de Casa (Até ${deadline.toLocaleString('pt-BR')})</span>`;
        }
        return '<span class="status-awaiting">Aguardando Ativação</span>';
    };

    return `
        <header class="app-header">
            <h1>Gestão de Provas</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar ao Painel</a>
        </header>
        <div class="container">
            ${quizzes.length > 0 ? quizzes.map(quiz => `
                <div class="card">
                    <div class="quiz-management-item">
                        <div class="quiz-info">
                            <h4>${quiz.title}</h4>
                            <p>${quiz.description || 'Sem descrição.'}</p>
                            <div>${getStatusLabel(quiz)}</div>
                        </div>
                        <div class="quiz-actions">
                            ${quiz.status === 'awaiting' ? `<button class="btn btn-primary start-quiz-btn" data-quiz-id="${quiz.id}">Ativar Prova</button>` : ''}
                            ${quiz.status === 'live' ? `<a href="#live/results/${quiz.id}" class="btn btn-secondary">Ver Placar</a>` : ''}
                            <a href="#quiz/edit/${quiz.id}" class="btn btn-secondary btn-inline">Editar</a>
                        </div>
                    </div>
                </div>
            `).join('') : '<p>Nenhum quiz criado. <a href="#quiz/new">Crie um agora!</a></p>'}
        </div>
        <style>
            .quiz-management-item { display: flex; justify-content: space-between; align-items: center; }
            .status-live { color: var(--secondary-color); font-weight: bold; }
            .status-homework { color: #3b82f6; font-weight: bold; }
            .status-finished { color: var(--text-dark); }
            .status-awaiting { color: #f59e0b; }
        </style>
    `;
}

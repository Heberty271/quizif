export function StudentDashboardView(userData, pending = [], completed = []) {
    const avatarUrl = userData.avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${userData.name}`;

    return `
        <header class="app-header">
            <h1>Painel do Aluno</h1>
            <div class="header-profile">
                <a href="#student/profile" class="profile-link">
                    <span>${userData.name}</span>
                    <img src="${avatarUrl}" alt="Avatar do aluno" class="header-avatar">
                </a>
                <button id="logout-btn" class="btn btn-danger btn-inline">Sair</button>
            </div>
        </header>
        <div class="container">
            <h2>Avaliações a Realizar</h2>
            ${pending.length > 0 ? pending.map(attempt => `
                <div class="card">
                    <h3>${attempt.quizTitle}</h3>
                    <p>Estado: ${attempt.status === 'pending' ? 'Não Iniciado' : 'Em Progresso'}</p>
                    <button class="btn btn-secondary start-quiz-btn btn-inline" style="margin-top:1rem;" data-attempt-id="${attempt.id}">
                        ${attempt.status === 'pending' ? 'Iniciar Avaliação' : 'Continuar Avaliação'}
                    </button>
                </div>
            `).join('') : '<p>Não tem nenhuma avaliação pendente.</p>'}
            
            <h2 style="margin-top: 2rem;">Avaliações Concluídas</h2>
             ${completed.length > 0 ? completed.map(attempt => `
                <div class="card">
                    <h3>${attempt.quizTitle}</h3>
                    <p><strong>Pontuação:</strong> ${attempt.totalScore || 0} pts</p>
                    <p><strong>Nota:</strong> ${attempt.finalGrade || 'N/A'}</p>
                    <button class="btn btn-primary btn-inline view-review-btn" style="margin-top:1rem;" data-attempt-id="${attempt.id}">
                        Ver Detalhes
                    </button>
                </div>
            `).join('') : '<p>Ainda não concluiu nenhuma avaliação.</p>'}
        </div>
        <style>
            .header-profile {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .profile-link {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
                color: var(--text-dark);
                font-weight: 600;
            }
            .header-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid var(--primary-color);
            }
        </style>
    `;
}

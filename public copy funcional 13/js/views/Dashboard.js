
const Header = `
<header class="app-header">
    <h1>Codehoot</h1>
</header>
`;

export function DashboardView(quizzes = []) {
    return `
        ${Header}
        <div class="container">
            <div class="card">
                <h2 style="margin-top: 0;">Entrar em uma Sala</h2>
                <form id="join-session-form" class="join-form">
                    <input type="text" name="joinCode" placeholder="Código da Sala" class="form-control" required>
                    <button type="submit" class="btn btn-secondary" style="margin-top: 1rem;">Entrar</button>
                </form>
            </div>
        
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2>Meus Quizzes</h2>
                <button id="create-quiz-btn" class="btn btn-primary">Criar Quiz</button>
            </div>
            
            <div class="quiz-grid">
                ${quizzes.length > 0 ? quizzes.map(quiz => `
                    <div class="quiz-card">
                        <div class="quiz-card-content">
                            <h3>${quiz.title}</h3>
                            <p>${quiz.questions?.length || 0} questões</p>
                        </div>
                        <div class="quiz-card-footer">
                            <button class="btn btn-primary view-quiz-btn" data-quiz-id="${quiz.id}">Ver Detalhes</button>
                        </div>
                    </div>
                `).join('') : '<p>Você ainda não criou nenhum quiz.</p>'}
            </div>
        </div>
    `;
}
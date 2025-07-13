export function ResultsView(quiz, attempt) {
    return `
        <header class="app-header">
            <h1>Resultado: ${quiz.title}</h1>
        </header>
        <div class="container">
            <div class="card" style="text-align: center;">
                <h2>Parabéns!</h2>
                <p>Você concluiu a avaliação.</p>
                <p style="font-size: 1.5rem; font-weight: bold;">Sua Pontuação Final:</p>
                <p style="font-size: 3rem; font-weight: bold; color: var(--primary-color);">${attempt.totalScore || 0} pts</p>
                <a href="#student/dashboard" class="btn btn-primary btn-inline" style="margin-top: 2rem;">Voltar para o Painel</a>
            </div>
            <div class="card" id="final-leaderboard-container">
                 <h3>Classificação Final</h3>
                 <div class="spinner"></div>
            </div>
        </div>
    `;
}

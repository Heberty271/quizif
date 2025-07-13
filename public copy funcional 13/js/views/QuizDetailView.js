export function QuizDetailView(quiz) {
    if (!quiz) return '<h2>Quiz não encontrado</h2>';
    return `
        <header class="app-header">
             <h1>${quiz.title}</h1>
             <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar</a>
        </header>
        <div class="container">
             <div class="card" id="attempts-list">
                <h3>Tentativas dos Alunos</h3>
                <!-- Lista de tentativas será carregada aqui -->
                <p>Carregando...</p>
             </div>
        </div>
    `;
}
export function TeacherDashboardView() {
    return `
        <header class="app-header">
            <h1>Painel do Professor</h1>
            <button id="logout-btn" class="btn btn-danger btn-inline">Sair</button>
        </header>
        <div class="container">
            <div class="dashboard-grid">
                <a href="#students" class="dashboard-card">
                    <h3>Gerir Alunos</h3>
                    <p>Cadastre e veja os seus alunos.</p>
                </a>
                <a href="#classes" class="dashboard-card">
                    <h3>Gerir Turmas</h3>
                    <p>Crie turmas e adicione alunos.</p>
                </a>
                <a href="#question-bank" class="dashboard-card">
                    <h3>Banco de Questões</h3>
                    <p>Crie e organize as suas questões.</p>
                </a>
                <a href="#quiz/new" class="dashboard-card">
                    <h3>Criar Novo Quiz</h3>
                    <p>Monte uma avaliação com as suas questões.</p>
                </a>
                <a href="#live-dashboard" class="dashboard-card live">
                    <h3>Provas ao Vivo</h3>
                    <p>Inicie e acompanhe as provas.</p>
                </a>
                <a href="#results" class="dashboard-card">
                    <h3>Resultados Finais</h3>
                    <p>Consulte as notas e pontuações.</p>
                </a>
                  <a href="#grades-report" class="dashboard-card">
                    <h3>Relatório de Notas</h3>
                    <p>Exporte as notas e veja estatísticas.</p>
                </a>
            </div>
        </div>
        <style>
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.5rem;
            }
            .dashboard-card {
                background: var(--bg-glass);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border-glass);
                padding: 1.5rem;
                border-radius: 0.75rem;
                text-decoration: none;
                color: var(--text-light);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .dashboard-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 15px rgba(0,0,0,0.2);
                border-color: rgba(255, 255, 255, 0.2);
            }
            .dashboard-card h3 {
                margin-top: 0;
                color: var(--text-light);
            }
             .dashboard-card p {
                color: var(--text-dark);
            }
            .dashboard-card.live h3 {
                color: var(--secondary-color);
            }
        </style>
    `;
}
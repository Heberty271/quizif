export function ResultsDashboardView(attempts = [], quizzes = [], classes = [], students = []) {
    return `
        <header class="app-header">
            <h1>Resultados Gerais</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar ao Painel</a>
        </header>
        <div class="container">
            <div class="card filters-card">
                <h3>Filtros</h3>
                <div class="filters-container">
                    <div class="form-group">
                        <label for="quiz-filter">Filtrar por Quiz</label>
                        <select id="quiz-filter" class="form-control">
                            <option value="">Todos os Quizzes</option>
                            ${quizzes.map(q => `<option value="${q.id}">${q.title}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="class-filter">Filtrar por Turma</label>
                        <select id="class-filter" class="form-control">
                            <option value="">Todas as Turmas</option>
                            ${classes.map(c => `<option value="${c.id}">${c.className}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="student-filter">Filtrar por Aluno</label>
                        <select id="student-filter" class="form-control">
                            <option value="">Todos os Alunos</option>
                            ${students.map(s => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <div class="card">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>Quiz</th>
                            <th>Turma</th>
                            <th>Data de Conclusão</th>
                            <th>Pontuação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="results-table-body">
                        <!-- Os resultados filtrados serão inseridos aqui -->
                    </tbody>
                </table>
            </div>
        </div>
        <style>
            .filters-container { display: flex; gap: 1rem; flex-wrap: wrap; }
            .filters-container .form-group { flex-grow: 1; min-width: 200px; }
            .results-table { width: 100%; border-collapse: collapse; }
            .results-table th, .results-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #eee; }
            .results-table th { background-color: #f9fafb; }
        </style>
    `;
}
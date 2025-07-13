export function GradesReportView(classes, students, quizzes, attempts) {
    return `
        <header class="app-header">
            <h1>Relatório de Notas e Estatísticas</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar</a>
        </header>
        <div class="container">
            <div class="card filters-card">
                <div class="filter-group">
                    <label for="class-filter">Filtrar por Turma:</label>
                    <select id="class-filter" class="form-control">
                        <option value="">Todas as Turmas</option>
                        ${classes.map(c => `<option value="${c.id}">${c.className}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="student-filter">Filtrar por Aluno:</label>
                    <select id="student-filter" class="form-control">
                        <option value="">Todos os Alunos</option>
                        ${students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label for="quiz-filter">Filtrar por Atividade:</label>
                    <select id="quiz-filter" class="form-control">
                        <option value="">Todas as Atividades</option>
                        ${quizzes.map(q => `<option value="${q.id}">${q.title}</option>`).join('')}
                    </select>
                </div>
                <button id="export-csv-btn" class="btn btn-primary">Exportar para CSV</button>
            </div>

            <div class="tabs">
                <button class="tab-link active" data-tab="tab-table">Tabela de Notas</button>
                <button class="tab-link" data-tab="tab-quiz-analysis">Análise por Atividade</button>
                <button class="tab-link" data-tab="tab-student-history">Histórico do Aluno</button>
                <button class="tab-link" data-tab="tab-class-comparison">Comparação de Turmas</button>
            </div>

            <div id="tab-table" class="tab-content active">
                <div class="card">
                    <table class="grades-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Turma</th>
                                <th>Atividade</th>
                                <th>Nota</th>
                                <th>Pontuação (Jogo)</th>
                            </tr>
                        </thead>
                        <tbody id="grades-table-body"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-quiz-analysis" class="tab-content">
                <div class="card">
                    <h3>Análise de Desempenho por Questão</h3>
                    <div id="question-analysis-container">
                        <p>Selecione uma atividade no filtro acima para ver as estatísticas.</p>
                    </div>
                </div>
            </div>

            <div id="tab-student-history" class="tab-content">
                <div class="card">
                    <h3>Evolução do Aluno</h3>
                    <div id="student-history-container">
                        <p>Selecione um aluno para ver o seu histórico de notas.</p>
                    </div>
                </div>
            </div>

            <div id="tab-class-comparison" class="tab-content">
                <div class="card">
                    <h3>Comparação de Desempenho entre Turmas</h3>
                    <div id="class-comparison-container">
                        <canvas id="class-comparison-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .filters-card { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end; }
            .filter-group { flex: 1 1 200px; }
            .grades-table { width: 100%; border-collapse: collapse; }
            .grades-table th, .grades-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid var(--border-glass); }
            .grades-table th { background-color: rgba(255,255,255,0.1); }
            .tabs { display: flex; border-bottom: 1px solid var(--border-glass); margin-bottom: 1.5rem; }
            .tab-link { background: none; border: none; padding: 1rem 1.5rem; cursor: pointer; font-size: 1rem; font-weight: 600; color: var(--text-dark); border-bottom: 3px solid transparent; margin-bottom: -1px; }
            .tab-link.active { border-color: var(--primary-color); color: var(--text-light); }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
        </style>
    `;
}

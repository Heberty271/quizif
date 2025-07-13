export function QuizEditorView(quiz = {}, classes = []) {
    const deadlineValue = quiz.deadline ? new Date(quiz.deadline.seconds * 1000).toISOString().slice(0, 16) : '';
    return `
        <header class="app-header">
            <h1>${quiz.id ? 'Editar' : 'Criar'} Quiz</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar ao Painel</a>
        </header>
        <div class="container">
            <form id="quiz-editor-form" class="card">
                <h2>Informações do Quiz</h2>
                <div class="form-group">
                    <label for="title">Título do Quiz</label>
                    <input type="text" id="title" name="title" class="form-control" value="${quiz.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="description">Descrição</label>
                    <textarea id="description" name="description" class="form-control">${quiz.description || ''}</textarea>
                </div>
                 <div class="form-group">
                    <label for="classId">Associar à Turma</label>
                    <select id="classId" name="classId" class="form-control" required>
                        <option value="">Selecione uma turma...</option>
                        ${classes.map(c => `<option value="${c.id}" ${quiz.classId === c.id ? 'selected' : ''}>${c.className}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="totalValue">Valor Total da Prova (ex: 2.5)</label>
                    <input type="number" id="totalValue" name="totalValue" class="form-control" min="0" step="0.1" value="${quiz.totalValue || 2.5}" required>
                </div>
                <div class="form-group">
                    <label for="mode">Modo de Jogo</label>
                    <select id="mode" name="mode" class="form-control">
                        <option value="live" ${quiz.mode === 'live' ? 'selected' : ''}>Ao Vivo</option>
                        <option value="homework" ${quiz.mode === 'homework' ? 'selected' : ''}>Trabalho de Casa</option>
                    </select>
                </div>
                <div class="form-group" id="deadline-group" style="display: ${quiz.mode === 'homework' ? 'block' : 'none'};">
                    <label for="deadline">Data de Entrega</label>
                    <input type="datetime-local" id="deadline" name="deadline" class="form-control" value="${deadlineValue}">
                </div>

                <hr>

                <h2>Questões do Quiz</h2>
                <div id="questions-list-container">
                    <!-- As questões adicionadas aparecerão aqui -->
                </div>

                <div class="quiz-actions">
                    <a href="#question/new/multiple-choice" class="btn btn-secondary">Nova Questão (Múltipla Escolha)</a>
                    <a href="#question/new/coding" class="btn btn-secondary">Nova Questão (Código)</a>
                    <a href="#question/new/matching" class="btn btn-secondary">Nova Questão (Relacionar)</a>
                    <button type="button" id="add-from-bank-btn" class="btn btn-primary">Adicionar do Banco</button>
                </div>
                
                <button type="submit" class="btn btn-primary" style="margin-top: 2rem;">Guardar Quiz</button>
            </form>
        </div>
        <style>
            .quiz-actions { display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
        </style>
    `;
}

export function renderCurrentQuestions(questions = [], container) {
    if (questions.length === 0) {
        container.innerHTML = '<p>Nenhuma questão adicionada a este quiz. Adicione do seu banco ou crie uma nova.</p>';
        return;
    }

    container.innerHTML = questions.map((q, index) => `
        <div class="card question-bank-item">
            <span>${q.text}</span>
            <button type="button" class="btn btn-danger btn-sm remove-quiz-question-btn" data-index="${index}">Remover</button>
        </div>
    `).join('');
}
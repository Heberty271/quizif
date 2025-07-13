export function QuestionEditorView(question = {}) {
    const isNew = !question.id;
    const type = question.type;

    const data = {
        text: question.text || '',
        imageUrl: question.imageUrl || '',
        weight: question.weight || 1,
        timeLimit: question.timeLimit || 30,
        tags: question.tags?.join(', ') || '',
        options: question.options || ['', ''],
        correctAnswerIndex: question.correctAnswerIndex || 0,
        htmlCorrect: question.htmlCorrect || '',
        cssCorrect: question.cssCorrect || '',
        jsCorrect: question.jsCorrect || '',
        pairs: question.pairs || [{colA: '', colB: ''}, {colA: '', colB: ''}]
    };

    const multipleChoiceFields = `
        <div id="multiple-choice-fields">
            <h4>Alternativas</h4>
            <div id="options-container">
                ${data.options.map((opt, optIndex) => `
                    <div class="option-group">
                        <input type="radio" name="correct-answer" value="${optIndex}" ${data.correctAnswerIndex === optIndex ? 'checked' : ''} required>
                        <input type="text" name="option" class="form-control" value="${opt}" required>
                        <button type="button" class="btn-icon remove-option-btn">&times;</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" id="add-option-btn-editor" class="btn btn-secondary btn-sm">+ Alternativa</button>
        </div>
    `;

    const codingFields = `
        <div id="coding-fields">
            <h4>Código de Gabarito (para correção da IA)</h4>
            <div class="form-group"><label>HTML Gabarito</label><textarea name="htmlCorrect" class="form-control code-editor">${data.htmlCorrect}</textarea></div>
            <div class="form-group"><label>CSS Gabarito</label><textarea name="cssCorrect" class="form-control code-editor">${data.cssCorrect}</textarea></div>
            <div class="form-group"><label>JavaScript Gabarito</label><textarea name="jsCorrect" class="form-control code-editor">${data.jsCorrect}</textarea></div>
        </div>
    `;

    const matchingFields = `
        <div id="matching-fields">
            <h4>Pares para Relacionar</h4>
            <div id="matching-pairs-container">
                ${data.pairs.map((pair) => `
                    <div class="matching-pair-group">
                        <input type="text" name="colA" class="form-control" placeholder="Item da Coluna A" value="${pair.colA || ''}" required>
                        <span>-</span>
                        <input type="text" name="colB" class="form-control" placeholder="Item da Coluna B" value="${pair.colB || ''}" required>
                        <button type="button" class="btn-icon remove-pair-btn">&times;</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" id="add-pair-btn" class="btn btn-secondary btn-sm">+ Adicionar Par</button>
        </div>
    `;

    return `
        <header class="app-header">
            <h1>${isNew ? 'Criar Nova Questão' : 'Editar Questão'}</h1>
            <a href="#question-bank" class="btn btn-secondary btn-inline">Voltar ao Banco</a>
        </header>
        <div class="container">
            <form id="question-editor-form" class="card" data-type="${type}">
                <div class="form-group">
                    <label for="text">Enunciado da Questão</label>
                    <textarea id="text" name="text" class="form-control" rows="3" required>${data.text}</textarea>
                </div>
                <div class="form-group">
                    <label for="imageUrl">URL da Imagem (Opcional)</label>
                    <input type="text" id="imageUrl" name="imageUrl" class="form-control" value="${data.imageUrl}">
                </div>
                <div class="question-meta">
                    <div class="form-group">
                        <label for="weight">Peso da Questão (1x, 2x, etc.)</label>
                        <input type="number" id="weight" name="weight" class="form-control" min="1" value="${data.weight}">
                    </div>
                    <div class="form-group">
                        <label for="timeLimit">Tempo Limite (segundos)</label>
                        <input type="number" id="timeLimit" name="timeLimit" class="form-control" min="5" value="${data.timeLimit}">
                    </div>
                </div>
                 <div class="form-group">
                    <label for="tags">Tags (separadas por vírgula)</label>
                    <input type="text" id="tags" name="tags" class="form-control" placeholder="ex: html, css, básico" value="${data.tags}">
                </div>

                ${type === 'multiple-choice' ? multipleChoiceFields : ''}
                ${type === 'coding' ? codingFields : ''}
                ${type === 'matching' ? matchingFields : ''}
                
                <button type="submit" class="btn btn-primary" style="margin-top: 2rem;">Guardar Questão</button>
            </form>
        </div>
        <style>
            .option-group, .matching-pair-group { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
            .option-group input[type="radio"] { flex-shrink: 0; }
        </style>
    `;
}
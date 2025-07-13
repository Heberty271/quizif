export function QuestionBankModalView(questions = [], isLoading = false) {
    let bodyContent = '';
    if (isLoading) {
        bodyContent = '<div class="spinner"></div>';
    } else if (questions.length > 0) {
        bodyContent = questions.map(q => `
            <div class="question-bank-item">
                <input type="checkbox" name="bank-question" value="${q.id}" id="q-${q.id}">
                <label for="q-${q.id}">${q.text}</label>
            </div>
        `).join('');
    } else {
        bodyContent = '<p>Nenhuma questão no seu banco. Crie uma nova!</p>';
    }

    return `
        <div id="question-bank-modal" class="modal-overlay">
            <div class="modal-content">
                <header class="modal-header">
                    <h2>Selecione Questões do Banco</h2>
                    <button id="close-modal-btn" class="btn-icon">&times;</button>
                </header>
                <div class="modal-body">${bodyContent}</div>
                <footer class="modal-footer">
                    <button id="add-selected-questions-btn" class="btn btn-primary" ${isLoading || questions.length === 0 ? 'disabled' : ''}>Adicionar Selecionadas</button>
                </footer>
            </div>
        </div>
    `;
}
export function QuestionBankView(questions = []) {
    return `
        <header class="app-header">
            <h1>Banco de Questões</h1>
            <div class="header-actions">
                <a href="#question/new/multiple-choice" class="btn btn-primary btn-inline">Nova Questão (Múltipla Escolha)</a>
                <a href="#question/new/coding" class="btn btn-primary btn-inline">Nova Questão (Código)</a>
            </div>
        </header>
        <div class="container">
            <div class="card">
                <h2>Suas Questões Guardadas</h2>
                <p>Aqui pode ver, editar e apagar todas as questões que criou. Use as tags para organizar e encontrar facilmente o que precisa.</p>
            </div>
            <div id="question-list">
                ${questions.length > 0 ? questions.map(question => `
                    <div class="card question-bank-item">
                        <div class="question-bank-text">
                            <p>${question.text}</p>
                            <div class="tags-container">
                                <span class="type-tag">${question.type === 'multiple-choice' ? 'Múltipla Escolha' : 'Código'}</span>
                                ${question.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                            </div>
                        </div>
                        <div class="question-bank-actions">
                            <a href="#question/edit/${question.id}" class="btn btn-secondary btn-inline">Editar</a>
                            <button class="btn btn-danger btn-inline delete-question-btn" data-id="${question.id}">Apagar</button>
                        </div>
                    </div>
                `).join('') : '<p>O seu banco de questões está vazio. Clique para criar uma nova!</p>'}
            </div>
        </div>
        <style>
            .header-actions { display: flex; gap: 1rem; }
            .question-bank-item { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
            .question-bank-text p { margin: 0 0 0.5rem 0; font-weight: 600; }
            .tags-container { display: flex; gap: 0.5rem; flex-wrap: wrap; }
            .tags-container .tag, .tags-container .type-tag { font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 1rem; }
            .tags-container .type-tag { background-color: #e0e7ff; color: #4338ca; }
            .tags-container .tag { background-color: #f3f4f6; color: #4b5563; }
            .question-bank-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        </style>
    `;
}

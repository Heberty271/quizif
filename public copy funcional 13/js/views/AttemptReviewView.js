export function AttemptReviewView(quiz, attempt, yearLevel) {
    const escapeHTML = (str) => str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
        <header class="app-header">
            <h1>Revisão: ${quiz.title}</h1>
            <a href="#student/dashboard" class="btn btn-secondary btn-inline">Voltar ao Painel</a>
        </header>
        <div class="container">
            <div class="card">
                <h2>Sua Avaliação</h2>
                <p><strong>Sua Pontuação:</strong> ${attempt.totalScore} pontos</p>
                <p><strong>Sua Nota Final:</strong> ${attempt.finalGrade}</p>
            </div>

            ${attempt.questionOrder.map((originalQuestionIndex, reviewIndex) => {
                const question = quiz.questions[originalQuestionIndex];
                const studentAnswer = attempt.answers[reviewIndex];

                if (!studentAnswer) return '<div class="card"><p>Questão não respondida.</p></div>';

                let answerContent = '';
                if (question.type === 'multiple-choice') {
                    const isCorrect = studentAnswer.isCorrect;
                    
                    let optionOrder = [];
                    if (attempt.optionOrders && JSON.parse(attempt.optionOrders)[originalQuestionIndex]) {
                         optionOrder = JSON.parse(attempt.optionOrders)[originalQuestionIndex];
                    } else {
                        optionOrder = [...Array(question.options.length).keys()];
                    }

                    answerContent = `
                        <h4>A sua resposta:</h4>
                        <div class="options-review">
                        ${optionOrder.map(optIndex => {
                            const optText = question.options[optIndex];
                            let className = '';
                            if (optIndex === studentAnswer.answerIndex) {
                                className = isCorrect ? 'correct' : 'incorrect';
                            } else if (optIndex === question.correctAnswerIndex) {
                                className = 'correct';
                            }
                            return `<div class="option-item ${className}">${optText}</div>`;
                        }).join('')}
                        </div>
                    `;
                } else if (question.type === 'coding') {
                    const showHTML = `<div class="editor-pane"><label>Seu HTML</label><textarea readonly>${studentAnswer.html || ''}</textarea></div>`;
                    const showCSS = `<div class="editor-pane"><label>Seu CSS</label><textarea readonly>${studentAnswer.css || ''}</textarea></div>`;
                    const showJS = `<div class="editor-pane"><label>Seu JS</label><textarea readonly>${studentAnswer.js || ''}</textarea></div>`;

                    let editors = '';
                    if (yearLevel === 1) editors = showHTML + showCSS;
                    else if (yearLevel === 2) editors = showHTML + showJS;
                    else editors = showHTML + showCSS + showJS;

                    answerContent = `
                        <div class="code-review-container">${editors}</div>
                        <div class="preview-pane"><label>Sua Pré-visualização</label><iframe data-html="${escapeHTML(studentAnswer.html || '')}" data-css="${escapeHTML(studentAnswer.css || '')}" data-js="${escapeHTML(studentAnswer.js || '')}"></iframe></div>
                        <div class="ai-feedback-box">
                            <h4>Feedback da Correção</h4>
                            <p><strong>Nota (0-10):</strong> ${studentAnswer.manualGrade ?? 'N/A'}</p>
                            <p class="ai-feedback-text" data-feedback="${studentAnswer.feedback || 'Sem feedback.'}"></p>
                        </div>
                    `;
                }

                return `
                    <div class="card question-review-card">
                        <div class="card-header">
                            <h4>Questão ${reviewIndex + 1}: ${question.text} (Peso: ${question.weight || 1}x)</h4>
                        </div>
                        <div class="card-body">${answerContent}</div>
                    </div>
                `;
            }).join('')}
        </div>
        <style>
            .question-review-card { padding: 0; }
            .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-glass);}
            .card-header h4 { margin: 0; }
            .card-body { padding: 1.5rem; }
            .options-review .option-item { padding: 0.75rem; border: 1px solid var(--border-glass); border-radius: 0.5rem; margin-bottom: 0.5rem; }
            .options-review .option-item.correct { background-color: rgba(16, 185, 129, 0.2); border-color: var(--secondary-color); color: #6ee7b7; font-weight: bold; }
            .options-review .option-item.incorrect { background-color: rgba(239, 68, 68, 0.2); border-color: var(--danger-color); color: #fca5a5; font-weight: bold; }
            .code-review-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
            .editor-pane { display: flex; flex-direction: column; }
            .editor-pane label { font-weight: bold; margin-bottom: 0.5rem; }
            .editor-pane textarea { width: 100%; height: 200px; border-radius: 4px; font-family: monospace; background-color: #1e293b; color: #e2e8f0; resize: vertical; padding: 0.5rem; border: 1px solid var(--border-glass); }
            .preview-pane { margin-top: 1rem; }
            .preview-pane label { font-weight: bold; margin-bottom: 0.5rem; display: block; }
            .preview-pane iframe { width: 100%; height: 250px; border: 1px solid var(--border-glass); border-radius: 4px; background: white; }
            .ai-feedback-box { margin-top: 1rem; border-top: 1px solid var(--border-glass); padding-top: 1rem; background-color: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 0.5rem;}
            .ai-feedback-box h4 { color: var(--text-light); margin-top: 0; }
            .ai-feedback-box p { color: var(--text-dark); white-space: pre-wrap; }
        </style>
    `;
}

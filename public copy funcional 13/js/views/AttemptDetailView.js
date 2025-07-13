export function AttemptDetailView(quiz, attempt) {
    const studentName = attempt.studentEmail.split('@')[0];
    const escapeHTML = (str) => str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
        <header class="app-header">
            <h1>Revisão: ${quiz.title} - ${studentName}</h1>
            <a href="#results" class="btn btn-secondary btn-inline">Voltar</a>
        </header>
        <div class="container">
            <div class="card">
                <h2>Resumo da Avaliação</h2>
                <p><strong>Pontuação (Jogo):</strong> ${attempt.totalScore} pts</p>
                <p><strong>Nota Final:</strong> ${attempt.finalGrade || 'Aguardando avaliação'}</p>
            </div>

            ${quiz.questions.map((question, index) => {
                const studentAnswer = attempt.answers.find(a => a.questionIndex === index);
                let answerContent = '<div class="card-body"><p>Questão não respondida.</p></div>';

                if (studentAnswer) {
                    if (question.type === 'multiple-choice') {
                        const isCorrect = studentAnswer.isCorrect;
                        answerContent = `
                            <div class="card-body">
                                <p><strong>Resposta do Aluno:</strong> ${question.options[studentAnswer.answerIndex]}</p>
                                <p><strong>Resposta Correta:</strong> ${question.options[question.correctAnswerIndex]}</p>
                                <p><strong>Resultado:</strong> <span class="${isCorrect ? 'correct-text' : 'incorrect-text'}">${isCorrect ? 'Correta' : 'Incorreta'}</span></p>
                            </div>
                        `;
                    } else if (question.type === 'coding') {
                        const showHTML = `<div class="editor-pane"><label>HTML do Aluno</label><textarea readonly>${studentAnswer.html || ''}</textarea></div>`;
                        const showCSS = `<div class="editor-pane"><label>CSS do Aluno</label><textarea readonly>${studentAnswer.css || ''}</textarea></div>`;
                        const showJS = `<div class="editor-pane"><label>JS do Aluno</label><textarea readonly>${studentAnswer.js || ''}</textarea></div>`;
                        
                        let editors = '';
                        if (quiz.yearLevel === 1) editors = showHTML + showCSS;
                        else if (quiz.yearLevel === 2) editors = showHTML + showJS;
                        else editors = showHTML + showCSS + showJS;

                        answerContent = `
                            <div class="card-body">
                                <div class="code-review-container">${editors}</div>
                                <div class="preview-pane"><label>Pré-visualização</label><iframe data-html="${escapeHTML(studentAnswer.html || '')}" data-css="${escapeHTML(studentAnswer.css || '')}" data-js="${escapeHTML(studentAnswer.js || '')}"></iframe></div>
                                <div class="ai-feedback-box">
                                    <h4>Feedback da IA</h4>
                                    <p><strong>Nota (0-10):</strong> ${studentAnswer.manualGrade ?? 'Aguardando'}</p>
                                    <p class="ai-feedback-text" data-feedback="${studentAnswer.feedback || 'Aguardando feedback.'}"></p>
                                </div>
                            </div>
                        `;
                    }
                }

                return `
                    <div class="card question-review-card">
                        <div class="card-header">
                            <h4>Questão ${index + 1}: ${question.text} (Peso: ${question.weight || 1}x)</h4>
                        </div>
                        ${answerContent}
                    </div>
                `;
            }).join('')}
        </div>
        <style>
            .question-review-card { padding: 0; }
            .card-header { padding: 1rem 1.5rem; border-bottom: 1px solid #eee;}
            .card-header h4 { margin: 0; }
            .card-body { padding: 1.5rem; }
            .code-review-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
            .editor-pane { display: flex; flex-direction: column; }
            .editor-pane label { font-weight: bold; margin-bottom: 0.5rem; }
            .editor-pane textarea { width: 100%; height: 200px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; background-color: #f4f4f4; resize: vertical; padding: 0.5rem; }
            .preview-pane { margin-top: 1rem; }
            .preview-pane label { font-weight: bold; margin-bottom: 0.5rem; display: block; }
            .preview-pane iframe { width: 100%; height: 250px; border: 1px solid #ccc; border-radius: 4px; background: white; }
            .ai-feedback-box { margin-top: 1rem; border-top: 1px solid var(--border-glass); padding-top: 1rem; background-color: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 0.5rem;}
            .ai-feedback-box h4 { color: var(--text-light); }
            .ai-feedback-box p { color: var(--text-dark); white-space: pre-wrap; }
            .correct-text { color: var(--secondary-color); font-weight: bold; }
            .incorrect-text { color: var(--danger-color); font-weight: bold; }
        </style>
    `;
}

export function GameScreenView(session, quiz, isHost) {
    const questionIndex = session.currentQuestion;
    const question = quiz.questions[questionIndex];

    if (!question) {
        return '<h2>Carregando resultados...</h2>'
    }

    return `
        <div class="game-screen">
            <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h2 style="font-size: 2.5rem; margin-bottom: 3rem;">${question.text}</h2>
                ${question.type === 'multiple-choice' ? `
                    <div class="answer-grid">
                        ${question.options.map((opt, i) => `<button class="btn btn-primary answer-btn">${opt}</button>`).join('')}
                    </div>
                ` : `
                    <div>
                        <textarea class="form-control code-editor" rows="10" cols="80">${question.templateCode || ''}</textarea>
                        <button class="btn btn-secondary" style="margin-top: 1rem;">Enviar Código</button>
                    </div>
                `}
            </div>
            ${isHost ? `
                <div style="padding: 1rem; background: rgba(0,0,0,0.3); position: fixed; bottom: 0; left: 0; right: 0;">
                    <button id="next-question-btn" class="btn btn-primary">Próxima Questão</button>
                </div>
            ` : ''}
        </div>
    `;
            }
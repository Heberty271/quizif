export function QuizAttemptView(quiz, attempt) {
    return `
        <div class="attempt-page-v2">
            <aside class="sidebar-panel">
                <h3>Placar</h3>
                <div id="timer-circle" class="calm">
                    <span id="timer-icon"></span>
                    <span id="timer-circle-text"></span>
                </div>
                <div class="stats">
                    <div><span>Sua Pontuação</span><strong id="score-value">0</strong></div>
                    <div><span>Corretas</span><strong id="correct-value" class="correct-text">0</strong></div>
                    <div><span>Incorretas</span><strong id="incorrect-value" class="incorrect-text">0</strong></div>
                </div>
                <div id="question-progress-container">
                    <span id="question-progress-text"></span>
                    <div id="question-progress-bar"><div id="question-progress-bar-inner"></div></div>
                </div>
                <div id="leaderboard-container">
                    <h4>Ranking</h4>
                    <div id="ranking-list">
                        <div class="spinner"></div>
                    </div>
                </div>
                <div id="your-rank-summary"></div>
                <div class="navigation-buttons-sidebar">
                    <button id="finish-quiz-btn" class="btn btn-danger">Finalizar Tentativa</button>
                    <div id="auto-save-status"></div>
                </div>
            </aside>
            <main class="quiz-main-panel"></main>
        </div>
        <style>
            .attempt-page-v2 { display: flex; height: 100vh; background-color: transparent; }
            .sidebar-panel { width: 320px; flex-shrink: 0; background: var(--bg-glass); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-right: 1px solid var(--border-glass); padding: 1.5rem; display: flex; flex-direction: column; }
            .quiz-main-panel { flex-grow: 1; padding: 2rem 4rem; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }
            #timer-circle { width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 1.5rem auto; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: background-color 0.3s, box-shadow 0.3s; }
            #timer-circle.calm { background-color: var(--primary-color); box-shadow: 0 0 15px rgba(139, 92, 246, 0.5); }
            #timer-circle.urgent { background-color: var(--danger-color); animation: pulse-red 1.2s infinite; }
            #timer-icon { width: 24px; height: 24px; color: white; } #timer-icon svg { fill: currentColor; }
            #timer-circle-text { font-size: 2rem; font-weight: bold; color: white; }
            .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; text-align: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 1.5rem; }
            .stats div span { font-size: 0.8rem; color: var(--text-dark); } .stats div strong { display: block; font-size: 1.5rem; color: var(--text-light); }
            .correct-text { color: #10b981 !important; } .incorrect-text { color: #ef4444 !important; }
            #question-progress-container { margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-dark); }
            #question-progress-bar { width: 100%; height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-top: 0.5rem; }
            #question-progress-bar-inner { height: 100%; width: 0%; background-color: var(--primary-color); border-radius: 4px; transition: width 0.3s; }
            #leaderboard-container { flex-grow: 1; overflow-y: auto; }
            .ranking-item { display: flex; align-items: center; padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid var(--border-glass); }
            .ranking-item:last-child { border-bottom: none; }
            .medal-icon { font-size: 1.2rem; width: 30px; text-align: center; } .rank { font-weight: bold; width: 30px; text-align: center; color: var(--text-dark); }
            .ranking-item .name { flex-grow: 1; } .ranking-item .score { font-weight: bold; }
            #your-rank-summary { text-align: center; padding: 1rem; background-color: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; margin-top: 1rem; font-size: 0.9rem; }
            .navigation-buttons-sidebar { margin-top: 1.5rem; }
            .quiz-main-panel > .question-content-wrapper { width: 100%; max-width: 900px; display: flex; flex-direction: column; flex-grow: 1;}
            .quiz-main-panel h2 { font-size: 1.8rem; margin-top: 0; text-align: center; color: var(--text-light); } 
            .quiz-main-panel > p { text-align: center; margin-top: -0.5rem; margin-bottom: 2rem; color: var(--text-dark); }
            
            /* CORREÇÃO: Estilos para a imagem da questão */
            .question-image-container {
                width: 100%;
                max-height: 45vh;
                margin: 0 auto 1.5rem auto;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .question-image-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 0.75rem;
            }

            .question-text { font-size: 1.5rem; margin-bottom: 2rem; text-align: center; color: var(--text-light); }
            .answers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .answer-btn { padding: 1.5rem; font-size: 1.1rem; border-radius: 0.75rem; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-light); cursor: pointer; transition: all 0.2s; }
            .answer-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); border-color: var(--primary-color); }
            .answer-btn:disabled { cursor: not-allowed; opacity: 0.8; }
            .answer-btn.correct { background-color: var(--secondary-color); border-color: var(--secondary-hover); }
            .answer-btn.incorrect { background-color: var(--danger-color); border-color: var(--danger-hover); }
            .feedback-banner { margin-top: 1.5rem; padding: 1rem; border-radius: 0.5rem; font-weight: bold; text-align: center; }
            .feedback-banner.correct { background-color: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
            .feedback-banner.incorrect { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; }
            #next-question-button-container { display: flex; justify-content: flex-end; margin-top: 1rem; }
            .code-editor-layout { display: flex; flex-direction: column; height: 100%; gap: 1rem; width: 100%; }
            .code-editors-wrapper { display: flex; gap: 1rem; flex: 1; min-height: 200px; }
            .editor-pane { flex: 1; display: flex; flex-direction: column; }
            .editor-pane label { font-weight: bold; margin-bottom: 0.5rem; color: var(--text-dark); }
            .code-editor-wrapper { position: relative; flex-grow: 1; height: 100%; background: #2d2d2d; border-radius: 4px; border: 1px solid var(--border-glass); }
            .code-editor, .code-highlight-area { margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.65; width: 100%; height: 100%; position: absolute; top: 0; left: 0; overflow: auto; box-sizing: border-box; white-space: pre; word-wrap: break-word; }
            .code-editor { z-index: 2; background: transparent; color: transparent; caret-color: white; resize: none; border: none; }
            .code-highlight-area { z-index: 1; pointer-events: none; border: none; }
            .code-highlight-area code { white-space: pre-wrap !important; }
            .preview-and-console { display: flex; gap: 1rem; height: 550px; transition: height 0.3s ease-in-out; }
            .preview-pane { flex-grow: 1; display: flex; flex-direction: column; position: relative; }
            .preview-controls { display: flex; justify-content: flex-end; gap: 0.5rem; margin-bottom: 0.5rem; }
            .btn-icon { background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 4px; cursor: pointer; padding: 4px; width: 30px; height: 30px; } .btn-icon svg { fill: var(--text-dark); }
            #preview-frame { width: 100%; height: 100%; border: 1px solid var(--border-glass); border-radius: 4px; background: white; }
            #custom-console { flex-basis: 350px; flex-shrink: 0; background-color: #263238; color: #d4d4d4; font-family: monospace; font-size: 0.8rem; border-radius: 4px; display: flex; flex-direction: column; }
            .console-header { background-color: #37474f; padding: 4px 8px; font-weight: bold; }
            #custom-console-output { padding: 0.5rem; overflow-y: auto; flex-grow: 1; }
            .log-entry { padding: 2px 4px; border-bottom: 1px solid #333; white-space: pre-wrap; word-break: break-all; }
            .log-error { color: #f48771; }
            .log-warn { color: #f4d071; }
            @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        </style>
    `;
}

export function TeacherLiveResultView(quiz) {
    return `
        <div class="live-results-page">
            <header class="app-header">
                <h1>Placar ao Vivo: ${quiz.title}</h1>
                <a href="#live-dashboard" class="btn btn-secondary btn-inline">Voltar</a>
            </header>
            <div class="leaderboard-wrapper">
                <div id="podium-container">
                    <p class="waiting-message">A aguardar os primeiros resultados...</p>
                </div>
                <div id="list-container"></div>
            </div>
        </div>
        <style>
            .live-results-page { display: flex; flex-direction: column; height: 100vh; background: linear-gradient(135deg, #4c51bf, #6b46c1); color: white; overflow: hidden; }
            .leaderboard-wrapper { padding: 2rem; overflow-y: auto; flex-grow: 1; }
            #podium-container { display: flex; align-items: flex-end; justify-content: center; gap: 1rem; margin-bottom: 2rem; min-height: 250px; position: relative; }
            .waiting-message { font-size: 1.2rem; align-self: center; }
            .player-item { transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
            .podium-item { display: flex; flex-direction: column; align-items: center; text-align: center; width: 150px; padding: 1rem; border-radius: 0.75rem; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .podium-item.place-1 { order: 2; height: 220px; background: rgba(255, 215, 0, 0.2); border-color: #FFD700; transform: scale(1.1); }
            .podium-item.place-2 { order: 1; height: 180px; background: rgba(192, 192, 192, 0.2); border-color: #C0C0C0; }
            .podium-item.place-3 { order: 3; height: 160px; background: rgba(205, 127, 50, 0.2); border-color: #CD7F32; }
            .crown { width: 40px; height: 40px; margin-bottom: 0.5rem; color: #FFD700; filter: drop-shadow(0 0 5px #FFD700); animation: float 2s ease-in-out infinite; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .crown svg { fill: currentColor; }
            .player-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }
            .player-icon img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
            .player-name { font-weight: bold; font-size: 1.1rem; word-break: break-all; }
            .player-score { font-size: 1rem; opacity: 0.9; }
            #list-container { max-width: 600px; margin: 0 auto; }
            .list-item { display: flex; align-items: center; padding: 1rem; background: rgba(255, 255, 255, 0.1); border-radius: 0.5rem; margin-bottom: 0.5rem; }
            .list-item .rank { font-weight: bold; width: 40px; opacity: 0.8; }
            .list-item .player-icon.small { width: 40px; height: 40px; margin: 0 1rem; }
            .list-item .name { flex-grow: 1; }
            .list-item .score { font-weight: bold; }
        </style>
    `;
}
export function GameLobbyView(session, isHost) {
    return `
        <div class="game-lobby-screen">
            <p style="font-size: 1.5rem;">Código da Sala:</p>
            <div class="join-code">${session.joinCode}</div>
            <div class="player-list">
                <h3>Jogadores (${session.players.length})</h3>
                <ul style="list-style: none; padding: 0;">
                    ${session.players.map(p => `<li>${p.nickname}</li>`).join('')}
                </ul>
            </div>
            ${isHost ? `<button id="start-game-now-btn" class="btn btn-secondary" style="margin-top: 2rem; font-size: 1.5rem;">Começar Jogo!</button>` : '<p style="margin-top: 2rem;">Aguardando o anfitrião iniciar o jogo...</p>'}
        </div>
    `;
}
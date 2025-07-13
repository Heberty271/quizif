export async function ResultsScreenView(session, isHost) {
    return `
        <div class="results-screen">
            <h1 style="font-size: 4rem; color: #facc15;">Fim de Jogo!</h1>
            <div class="card" style="color: var(--text-dark); width: 100%; max-width: 500px;">
                <h2>Placar Final</h2>
                <ul style="list-style: none; padding: 0;">
                    ${session.players.map((p, i) => `<li style="display: flex; justify-content: space-between; padding: 0.5rem; background-color: ${i % 2 === 0 ? '#f9fafb' : ''};"><strong>${i+1}. ${p.nickname}</strong> <span>0 pts</span></li>`).join('')}
                </ul>
            </div>
            ${isHost ? `<button id="end-game-btn" class="btn btn-danger" style="margin-top: 2rem;">Voltar ao Início</button>` : ''}
        </div>
    `
}
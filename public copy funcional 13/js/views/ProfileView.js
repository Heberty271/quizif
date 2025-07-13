import { getBadgeDetails } from '../api/badges.js';

export function ProfileView(userData, completedAttempts = []) {
    const avatarUrl = userData.avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`;
    
    const totalQuizzes = completedAttempts.length;
    const totalGradeSum = completedAttempts.reduce((sum, attempt) => sum + parseFloat(attempt.finalGrade || 0), 0);
    const averageGrade = totalQuizzes > 0 ? (totalGradeSum / totalQuizzes).toFixed(2) : "N/A";

    const avatarStyles = [
        { name: 'Robôs Amigáveis', style: 'bottts' },
        { name: 'Aventureiros', style: 'adventurer' },
        { name: 'Aventureiros (Neutro)', style: 'adventurer-neutral' },
        { name: 'Avatares Personalizáveis', style: 'avataaars' },
        { name: 'Sorrisos', style: 'big-smile' },
        { name: 'Gatinhos', style: 'thumbs' },
        { name: 'Pixel Art', style: 'pixel-art' },
        { name: 'Personagens', style: 'micah' },
        { name: 'Doodles', style: 'croodles' },
        { name: 'Estilo Artístico', style: 'lorelei' },
        { name: 'Abstratos', style: 'shapes' },
        { name: 'Minimalistas', style: 'miniavs' },
        { name: 'Geométricos', style: 'identicon' },
        { name: 'Anéis', style: 'rings' },
        { name: 'Emojis Divertidos', style: 'fun-emoji' },
        { name: 'Estilo Notion', style: 'notionists' },
    ];
    
    const avatarSeeds = [
        'Leo', 'Cleo', 'Max', 'Zoe', 'Milo', 'Luna', 'Oscar', 'Ruby', 
        'Gizmo', 'Gadget', 'Bolt', 'Clank', 'Widget', 'Sprocket', 'Pixel', 'Vector',
        'Apollo', 'Artemis', 'Athena', 'Zeus', 'Hera', 'Poseidon', 'Hades', 'Hermes'
    ];

    return `
        <header class="app-header">
            <h1>Meu Perfil</h1>
            <a href="#student/dashboard" class="btn btn-secondary btn-inline">Voltar</a>
        </header>
        <div class="container">
            <div class="profile-header card">
                <img src="${avatarUrl}" alt="Seu Avatar" class="profile-avatar">
                <div class="profile-info">
                    <h2>${userData.name}</h2>
                    <p>${userData.email}</p>
                </div>
            </div>

            <div class="tabs">
                <button class="tab-link active" data-tab="tab-grades">Minhas Notas</button>
                <button class="tab-link" data-tab="tab-badges">Conquistas</button>
                <button class="tab-link" data-tab="tab-avatar">Mudar Avatar</button>
            </div>

            <div id="tab-grades" class="tab-content active">
                <div class="card">
                    <h3>Resumo de Notas</h3>
                    <p><strong>Nota Final Acumulada:</strong> ${averageGrade}</p>
                    <hr>
                    <h4>Histórico de Avaliações</h4>
                    <ul class="grades-list">
                        ${completedAttempts.length > 0 ? completedAttempts.map(a => `<li><strong>${a.quizTitle}:</strong> Nota ${a.finalGrade}</li>`).join('') : '<li>Nenhuma avaliação concluída ainda.</li>'}
                    </ul>
                </div>
            </div>

            <div id="tab-badges" class="tab-content">
                <div class="card">
                    <h3>Suas Conquistas</h3>
                    <div class="badge-grid">
                        ${(userData.badges && userData.badges.length > 0) ? userData.badges.map(badgeId => {
                            const badge = getBadgeDetails(badgeId);
                            return `<div class="badge-item" title="${badge.description}">
                                        <div class="badge-icon">${badge.icon}</div>
                                        <span>${badge.name}</span>
                                    </div>`;
                        }).join('') : '<p>Ainda não desbloqueou nenhuma conquista. Continue a jogar!</p>'}
                    </div>
                </div>
            </div>

            <div id="tab-avatar" class="tab-content">
                 <div class="card">
                    <h2>Escolha o seu Avatar</h2>
                    <form id="profile-form">
                        ${avatarStyles.map(styleInfo => `
                            <h3 class="avatar-style-title">${styleInfo.name}</h3>
                            <div class="avatar-grid">
                                ${avatarSeeds.map(seed => {
                                    const avatarUrl = `https://api.dicebear.com/8.x/${styleInfo.style}/svg?seed=${encodeURIComponent(seed)}`;
                                    return `
                                        <label class="avatar-option">
                                            <input type="radio" name="avatar" value="${avatarUrl}" ${userData.avatar === avatarUrl ? 'checked' : ''}>
                                            <img src="${avatarUrl}" alt="Avatar de ${seed}" loading="lazy">
                                        </label>
                                    `;
                                }).join('')}
                            </div>
                        `).join('')}
                        <button type="submit" class="btn btn-primary" style="margin-top: 1.5rem;">Guardar Alterações</button>
                    </form>
                </div>
            </div>
        </div>
        <style>
            .profile-header { display: flex; align-items: center; gap: 1.5rem; }
            .profile-avatar { width: 80px; height: 80px; border-radius: 50%; border: 4px solid var(--primary-color); }
            .profile-info h2 { margin: 0; color: var(--text-light); }
            .profile-info p { margin: 0; color: var(--text-dark); }
            .tabs { display: flex; border-bottom: 1px solid var(--border-glass); margin-bottom: 1.5rem; }
            .tab-link { background: none; border: none; padding: 1rem 1.5rem; cursor: pointer; font-size: 1rem; font-weight: 600; color: var(--text-dark); border-bottom: 3px solid transparent; margin-bottom: -1px; }
            .tab-link.active { border-color: var(--primary-color); color: var(--text-light); }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .grades-list { list-style-type: none; padding: 0; }
            .grades-list li { padding: 0.5rem 0; border-bottom: 1px solid var(--border-glass); }
            .badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }
            .badge-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding: 1rem; border-radius: 0.5rem; background: var(--bg-glass); border: 1px solid var(--border-glass); }
            .badge-icon { font-size: 2.5rem; }
            .avatar-style-title { margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.5rem; }
            .avatar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 1rem; }
            .avatar-option { cursor: pointer; border: 3px solid transparent; border-radius: 50%; padding: 4px; transition: all 0.2s ease-in-out; position: relative; }
            .avatar-option:hover { border-color: #666; }
            .avatar-option img { width: 100%; height: auto; border-radius: 50%; background-color: rgba(255,255,255,0.1); }
            .avatar-option input[type="radio"] { display: none; }
            .avatar-option input[type="radio"]:checked + img { border: 4px solid var(--primary-color); box-shadow: 0 0 15px rgba(99, 102, 241, 0.6); transform: scale(1.05); }
        </style>
    `;
}

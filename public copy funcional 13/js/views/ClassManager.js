export function ClassManagerView(classes = []) {
    return `
        <header class="app-header">
            <h1>Gerenciar Turmas</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar</a>
        </header>
        <div class="container">
            <div class="card">
                <h2>Criar Nova Turma</h2>
                <form id="create-class-form">
                    <div class="form-group">
                        <label for="className">Nome da Turma (ex: 1º Ano A)</label>
                        <input type="text" id="className" name="className" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="yearLevel">Ano da Turma</label>
                        <select id="yearLevel" name="yearLevel" class="form-control" required>
                            <option value="">Selecione o ano</option>
                            <option value="1">1º Ano (HTML & CSS)</option>
                            <option value="2">2º Ano (HTML & JS)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-inline">Criar Turma</button>
                </form>
            </div>

            <h2>Minhas Turmas</h2>
            ${classes.length > 0 ? classes.map(c => `
                <div class="card">
                    <a href="#class/detail/${c.id}" style="text-decoration: none; color: inherit;">
                        <h3>${c.className}</h3>
                        <p>${c.students.length} aluno(s)</p>
                    </a>
                </div>
            `).join('') : '<p>Você ainda não criou nenhuma turma.</p>'}
        </div>
    `;
}
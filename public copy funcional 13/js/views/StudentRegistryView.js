export function StudentRegistryView(students = []) {
    return `
        <header class="app-header">
            <h1>Cadastrar Alunos</h1>
            <a href="#dashboard" class="btn btn-secondary btn-inline">Voltar ao Painel</a>
        </header>
        <div class="container">
            <div class="card">
                <h2>Registrar Novo Aluno no Sistema</h2>
                <form id="register-student-form">
                    <div class="form-group">
                        <label for="studentName">Nome Completo do Aluno</label>
                        <input type="text" id="studentName" name="studentName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="studentEmail">Email do Aluno</label>
                        <input type="email" id="studentEmail" name="studentEmail" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="studentPassword">Senha Provisória</label>
                        <input type="password" id="studentPassword" name="studentPassword" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-inline">Cadastrar Aluno</button>
                </form>
            </div>

            <h2>Alunos Cadastrados</h2>
            <div class="card">
                <ul>
                    ${students.length > 0 ? students.map(s => `<li>${s.name} (${s.email})</li>`).join('') : '<p>Nenhum aluno cadastrado ainda.</p>'}
                </ul>
            </div>
        </div>
    `;
}
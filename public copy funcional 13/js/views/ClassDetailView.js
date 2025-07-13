export function ClassDetailView(classData, availableStudents = []) {
    return `
        <header class="app-header">
            <h1>${classData.className}</h1>
            <a href="#classes" class="btn btn-secondary btn-inline">Voltar para Turmas</a>
        </header>
        <div class="container">
            <div class="card">
                <h2>Adicionar Aluno à Turma</h2>
                <form id="add-student-form">
                    <div class="form-group">
                        <label for="studentSelector">Selecione um Aluno</label>
                        <select id="studentSelector" name="studentSelector" class="form-control" required>
                            <option value="">Selecione...</option>
                            ${availableStudents.map(s => `<option value="${s.uid},${s.email}">${s.name} (${s.email})</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-inline">Adicionar Aluno</button>
                </form>
            </div>
            <div class="card">
                <h2>Alunos na Turma</h2>
                <ul>
                    ${classData.students.length > 0 ? classData.students.map(s => `<li>${s.email}</li>`).join('') : '<li>Nenhum aluno adicionado ainda.</li>'}
                </ul>
            </div>
        </div>
    `;
}
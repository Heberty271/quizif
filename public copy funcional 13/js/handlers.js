import { render, showLoading } from './main.js';
import { LoginView } from './views/LoginView.js';
import { showClassDetail } from './views/teacher-views.js';
import { store } from './store.js';
import * as AuthAPI from './api/auth.js';
import * as FirestoreAPI from './api/firestore.js';

export async function handleLogin(e) {
    e.preventDefault();
    showLoading("A entrar...");
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    try {
        await AuthAPI.loginUser(email, password);
    } catch (error) {
        let message = "Email ou palavra-passe inválidos.";
        render(LoginView(message));
    }
}

export async function handleRegisterStudent(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.studentName.value;
    const email = form.elements.studentEmail.value;
    const password = form.elements.studentPassword.value;
    
    if(password.length < 6) {
        alert("A palavra-passe deve ter no mínimo 6 caracteres.");
        return;
    }

    try {
        await FirestoreAPI.registerStudent(email, password, name);
        alert(`Aluno ${name} registado com sucesso!`);
        form.reset();
    } catch(error) {
        console.error("Erro ao registar aluno: ", error);
        if(error.code === 'auth/email-already-in-use') {
            alert("Este email já está a ser utilizado por outra conta.");
        } else {
            alert("Ocorreu um erro ao registar o aluno.");
        }
    }
}

export async function handleCreateClass(e) {
    e.preventDefault();
    const form = e.target;
    const className = form.elements.className.value;
    const yearLevel = parseInt(form.elements.yearLevel.value, 10);
    if (!className || !yearLevel) {
        alert("Por favor, preencha todos os campos.");
        return;
    };
    
    await FirestoreAPI.createClass(className, yearLevel, store.user.uid);
    form.reset();
}

export async function handleAddStudentToClass(e) {
    e.preventDefault();
    const form = e.target;
    const selectedValue = form.elements.studentSelector.value;
    if(!selectedValue) {
        alert("Por favor, selecione um aluno.");
        return;
    };
    
    const [uid, email] = selectedValue.split(',');
    const name = form.elements.studentSelector.options[form.elements.studentSelector.selectedIndex].text.split(' (')[0];
    const studentData = { uid, email, name };
    
    await FirestoreAPI.addStudentToClass(store.currentClass.id, studentData);

    alert(`Aluno ${email} adicionado à turma.`);
    showClassDetail({ id: store.currentClass.id });
}

export async function handleSaveQuiz(questions) {
    const form = document.querySelector('#quiz-editor-form');
    const title = form.elements.title.value;
    const description = form.elements.description.value;
    const classId = form.elements.classId.value;
    const totalValue = parseFloat(form.elements.totalValue.value);
    const mode = form.elements.mode.value;
    const deadline = form.elements.deadline.value;

    if (!classId) {
        alert("Por favor, selecione uma turma para este quiz.");
        return;
    }
    if (mode === 'homework' && !deadline) {
        alert("Por favor, defina uma data de entrega para o modo 'Trabalho de Casa'.");
        return;
    }
    if (questions.length === 0) {
        alert("Adicione pelo menos uma questão ao quiz.");
        return;
    }

    showLoading("A guardar quiz...");
    try {
        await FirestoreAPI.saveQuiz({
            quizId: store.currentQuiz?.id,
            title, description, classId, totalValue, mode,
            deadline: mode === 'homework' ? new Date(deadline) : null,
            creatorId: store.user.uid,
            questions
        });

        alert("Quiz guardado com sucesso!");
        window.location.hash = '#quiz-management';
    } catch (error) {
        console.error("Erro ao guardar quiz:", error);
        alert("Não foi possível guardar o quiz.");
    }
}

export async function handleStartQuiz(quizId) {
    if(!confirm("Tem a certeza que deseja ativar esta prova? Ela ficará disponível para todos os alunos da turma.")) return;

    showLoading("A ativar prova e a atribuir aos alunos...");
    try {
        await FirestoreAPI.startQuizAndAssignToClass(quizId);
        window.location.hash = '#quiz-management';
    } catch (error) {
        console.error("Erro ao iniciar a prova:", error);
        alert("Ocorreu um erro ao iniciar a prova.");
    }
}

export async function handleSaveQuestionToBank(questionData) {
    showLoading("A guardar questão...");
    try {
        await FirestoreAPI.saveQuestionToBank(questionData);
        alert("Questão guardada com sucesso no seu banco!");
        window.location.hash = '#question-bank';
    } catch (error) {
        console.error("Erro ao guardar questão:", error);
        alert("Ocorreu um erro ao guardar a questão.");
    }
}
export async function handleUpdateProfile(e) {
    e.preventDefault();
    const form = e.target;
    const avatar = form.elements.avatar.value;

    if (!avatar) {
        alert("Por favor, selecione um avatar.");
        return;
    }

    showLoading("A guardar perfil...");
    try {
        await FirestoreAPI.updateUserProfile(store.user.uid, { avatar });
        alert("Perfil atualizado com sucesso!");
        store.userData.avatar = avatar; // Atualiza o estado local
    } catch (error) {
        console.error("Erro ao atualizar o perfil:", error);
        alert("Não foi possível atualizar o perfil.");
    } finally {
        window.location.hash = '#student/dashboard';
    }
}
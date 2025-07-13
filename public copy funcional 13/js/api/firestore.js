import { db } from './firebase.js';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, serverTimestamp, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { registerUserWithEmail } from './auth.js';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export async function registerStudent(email, password, name) {
    const userCredential = await registerUserWithEmail(email, password);
    const uid = userCredential.user.uid;
    // Ao registar, atribui um avatar padrão do DiceBear
    await setDoc(doc(db, "users", uid), { 
        name, 
        email, 
        role: "student", 
        avatar: `https://api.dicebear.com/8.x/adventurer/svg?seed=${name}` 
    });
    return uid;
}

export async function updateUserProfile(userId, data) {
    const userRef = doc(db, 'users', userId);
    return updateDoc(userRef, data);
}

export function createClass(className, yearLevel, teacherId) {
    return addDoc(collection(db, 'classes'), { className, yearLevel, teacherId, students: [] });
}

export function addStudentToClass(classId, studentData) {
    const classRef = doc(db, 'classes', classId);
    return updateDoc(classRef, { students: arrayUnion(studentData) });
}

export async function saveQuiz(data) {
    const { quizId, title, description, classId, creatorId, questions } = data;
    
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) throw new Error("Turma não encontrada.");
    
    const classData = classSnap.data();
    const quizData = { 
        title, description, creatorId, classId, 
        yearLevel: classData.yearLevel, questions, 
        status: 'awaiting', 
        updatedAt: serverTimestamp() 
    };

    if (quizId) {
        await setDoc(doc(db, 'quizzes', quizId), quizData, { merge: true });
    } else {
        quizData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'quizzes'), quizData);
    }
}

export async function startQuizAndAssignToClass(quizId) {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    if (!quizSnap.exists()) throw new Error("Quiz não encontrado.");

    const quizData = quizSnap.data();
    
    const classRef = doc(db, 'classes', quizData.classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) throw new Error("Turma associada ao quiz não encontrada.");
    
    const classData = classSnap.data();

    await updateDoc(quizRef, { status: 'live' });

    for (const student of classData.students) {
        const questionOrder = shuffleArray([...Array(quizData.questions.length).keys()]);
        const optionOrders = quizData.questions.map(q => 
            q.type === 'multiple-choice' ? shuffleArray([...Array(q.options.length).keys()]) : []
        );

        const attemptData = {
            quizId, quizTitle: quizData.title,
            studentId: student.uid, studentEmail: student.email,
            teacherId: quizData.creatorId, status: 'pending',
            assignedAt: serverTimestamp(),
            questionOrder,
            optionOrders: JSON.stringify(optionOrders),
            answers: [], totalScore: 0, finalGrade: null,
            correctCount: 0, incorrectCount: 0,
        };
        await addDoc(collection(db, 'quizAttempts'), attemptData);
    }
}
export async function updateManualGrade(attemptId, questionIndex, grade) {
    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);
    if (!attemptSnap.exists()) throw new Error("Tentativa não encontrada.");

    const attemptData = attemptSnap.data();
    const studentAnswers = attemptData.answers;

    // Encontra a resposta correspondente e atualiza a nota manual
    const answerToUpdate = studentAnswers.find(ans => ans.questionIndex === questionIndex);
    if (answerToUpdate) {
        answerToUpdate.manualGrade = grade;
    } else {
        // Se a resposta não existir (ex: o aluno pulou), cria-a
        studentAnswers.push({
            questionIndex: questionIndex,
            type: 'coding',
            manualGrade: grade,
        });
    }

    // Recalcula a nota final com a nova nota manual
    const quizSnap = await getDoc(doc(db, 'quizzes', attemptData.quizId));
    const quizData = quizSnap.data();
    const newFinalGrade = calculateFinalGrade(studentAnswers, quizData.questions);

    await updateDoc(attemptRef, {
        answers: studentAnswers,
        finalGrade: newFinalGrade
    });
}

// Função de utilitário para calcular a nota final
function calculateFinalGrade(answers, questions) {
    if (!questions || questions.length === 0 || !answers) return 0;
    
    let totalWeight = 0;
    let studentWeightedScore = 0;

    questions.forEach((q, originalIndex) => {
        const questionWeight = q.weight || 1;
        totalWeight += questionWeight;
        
        const studentAnswer = answers.find(ans => ans.questionIndex === originalIndex);
        if (studentAnswer) {
            if (q.type === 'multiple-choice' && studentAnswer.isCorrect) {
                studentWeightedScore += questionWeight * 10; // Acertou vale 10
            } else if (q.type === 'coding' && studentAnswer.manualGrade !== undefined) {
                studentWeightedScore += questionWeight * studentAnswer.manualGrade;
            }
        }
    });

    if (totalWeight === 0) return 2.5;
    const grade = (studentWeightedScore / (totalWeight * 10)) * 2.5;
    return Math.min(2.5, grade).toFixed(2);
}

export async function saveQuestionToBank(data) {
    const { id, ...questionData } = data;
    questionData.updatedAt = serverTimestamp();

    if (id) {
        const docRef = doc(db, "questionBank", id);
        await setDoc(docRef, questionData, { merge: true });
    } else {
        questionData.createdAt = serverTimestamp();
        await addDoc(collection(db, "questionBank"), questionData);
    }
}
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    getDoc,
    getDocs,
    onSnapshot,
    collection,
    query,
    where,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Play, Users, Trash2, CheckCircle, XCircle } from 'lucide-react';

// --- ATENÇÃO: CONFIGURAÇÃO DO FIREBASE ---
// É crucial substituir este objeto de configuração pelo do seu próprio projeto Firebase.
// Você pode encontrar essas informações no console do Firebase, nas configurações do seu projeto.
const firebaseConfig = {
    apiKey: "AIzaSyALvWVp38Xy0iwTvXMg5OkWhqiQ8oDXD6E",
    authDomain: "quizifmuz.firebaseapp.com",
    databaseURL: "https://quizifmuz-default-rtdb.firebaseio.com",
    projectId: "quizifmuz",
    storageBucket: "quizifmuz.firebasestorage.app",
    messagingSenderId: "621559995106",
    appId: "1:621559995106:web:9f6039d14fa239e06fdcbb"
};
// Para este exemplo, usaremos a configuração fornecida pelo ambiente.
// const firebaseConfig = typeof __firebase_config !== 'undefined' 
//     ? JSON.parse(__firebase_config) 
//     : { apiKey: "DEMO_KEY", authDomain: "DEMO.firebaseapp.com", projectId: "DEMO_PROJECT" };

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-codehoot-app';

// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COMPONENTES DA INTERFACE ---

// Componente para exibir um spinner de carregamento
const Spinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
);

// Componente para o cabeçalho principal
const Header = ({ user }) => (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <svg className="w-10 h-10 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59L7.41 13l1.41-1.41L11 13.17l4.59-4.59L17 10l-6 6z" fill="currentColor" /></svg>
            <h1 className="text-2xl font-bold text-gray-800">Codehoot</h1>
        </div>
        {user && <span className="text-sm text-gray-600">Logado como: {user.uid.substring(0, 10)}...</span>}
    </header>
);

// --- TELA INICIAL E AUTENTICAÇÃO ---

function AuthScreen({ onAuthSuccess }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const attemptSignIn = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Erro na autenticação:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                onAuthSuccess(user);
            }
            setLoading(false);
        });

        attemptSignIn();

        return () => unsubscribe();
    }, [onAuthSuccess]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <Spinner />
                <p className="mt-4 text-gray-600">Autenticando...</p>
            </div>
        );
    }

    return null; // A transição é gerenciada pelo App component
}

// --- DASHBOARD DO PROFESSOR ---

function TeacherDashboard({ user, onSelectQuiz, onCreateQuiz, onJoinSession }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/quizzes`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const quizzesData = [];
            querySnapshot.forEach((doc) => {
                quizzesData.push({ id: doc.id, ...doc.data() });
            });
            setQuizzes(quizzesData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar quizzes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleJoin = (e) => {
        e.preventDefault();
        if (joinCode.trim()) {
            onJoinSession(joinCode.trim());
        }
    }

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Entrar em uma Sala</h2>
                    <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Digite o código da sala"
                            className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                        <button type="submit" className="bg-green-500 text-white font-bold py-3 px-6 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center justify-center gap-2">
                            Entrar
                        </button>
                    </form>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Meus Quizzes</h2>
                    <button onClick={onCreateQuiz} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2">
                        <PlusCircle size={20} />
                        Criar Quiz
                    </button>
                </div>

                {loading ? <Spinner /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.length > 0 ? quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 truncate">{quiz.title}</h3>
                                    <p className="text-gray-500 mt-2 h-12 overflow-hidden">{quiz.description}</p>
                                    <p className="text-sm text-gray-400 mt-4">{quiz.questions?.length || 0} questões</p>
                                    <button onClick={() => onSelectQuiz(quiz.id)} className="mt-4 w-full bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-md hover:bg-indigo-200 transition-colors duration-300">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="md:col-span-3 text-center py-12 px-6 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Você ainda não criou nenhum quiz.</p>
                                <p className="text-gray-500 mt-2">Clique em "Criar Quiz" para começar!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- TELA DE CRIAÇÃO/EDIÇÃO DE QUIZ ---

function QuizEditor({ quizId, user, onBack }) {
    const [quiz, setQuiz] = useState({ title: '', description: '', questions: [] });
    const [loading, setLoading] = useState(false);
    const isNewQuiz = !quizId;

    useEffect(() => {
        if (!isNewQuiz) {
            setLoading(true);
            const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/quizzes`, quizId);
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setQuiz({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("Quiz não encontrado!");
                    onBack();
                }
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [quizId, user, isNewQuiz, onBack]);

    const handleQuizChange = (e) => {
        setQuiz({ ...quiz, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[index][field] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const handleCorrectAnswerChange = (qIndex, oIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].correctAnswerIndex = oIndex;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const handleTestCaseChange = (qIndex, tIndex, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].testCases[tIndex][field] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const addQuestion = (type) => {
        const newQuestion = {
            id: crypto.randomUUID(),
            type,
            text: '',
            ...(type === 'multiple-choice' && { options: ['', '', '', ''], correctAnswerIndex: 0 }),
            ...(type === 'coding' && { language: 'javascript', templateCode: 'function main(input) {\n  // Seu código aqui\n}', testCases: [{ input: '', expectedOutput: '' }] })
        };
        setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    };

    const removeQuestion = (index) => {
        const newQuestions = quiz.questions.filter((_, i) => i !== index);
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const addTestCase = (qIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].testCases.push({ input: '', expectedOutput: '' });
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const removeTestCase = (qIndex, tIndex) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].testCases = newQuestions[qIndex].testCases.filter((_, i) => i !== tIndex);
        setQuiz({ ...quiz, questions: newQuestions });
    };


    const saveQuiz = async () => {
        if (!quiz.title) {
            alert("O título do quiz é obrigatório.");
            return;
        }
        setLoading(true);
        try {
            const quizData = {
                ...quiz,
                creatorId: user.uid,
                updatedAt: serverTimestamp(),
            };

            if (isNewQuiz) {
                quizData.createdAt = serverTimestamp();
                await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/quizzes`), quizData);
            } else {
                await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/quizzes`, quizId), quizData);
            }
            onBack();
        } catch (error) {
            console.error("Erro ao salvar o quiz:", error);
            alert("Ocorreu um erro ao salvar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isNewQuiz) return <Spinner />;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline">
                    <ArrowLeft size={20} />
                    Voltar para o Dashboard
                </button>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">{isNewQuiz ? 'Criar Novo Quiz' : 'Editar Quiz'}</h2>

                    <div className="mb-6">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título do Quiz</label>
                        <input type="text" name="title" id="title" value={quiz.title} onChange={handleQuizChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea name="description" id="description" value={quiz.description} onChange={handleQuizChange} rows="3" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-700 mb-4 border-t pt-6">Questões</h3>

                    {quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 relative">
                            <button onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                                <Trash2 size={20} />
                            </button>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado da Questão {qIndex + 1}</label>
                                <textarea value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} rows="3" className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                            </div>

                            {q.type === 'multiple-choice' && (
                                <div>
                                    <h4 className="font-semibold text-gray-600 mb-2">Opções de Resposta</h4>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-3 mb-2">
                                            <input type="radio" name={`correctAnswer_${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleCorrectAnswerChange(qIndex, oIndex)} className="form-radio h-5 w-5 text-indigo-600" />
                                            <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Opção ${oIndex + 1}`} className="flex-grow p-2 border border-gray-300 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'coding' && (
                                <div>
                                    <h4 className="font-semibold text-gray-600 mb-2">Detalhes do Desafio de Código</h4>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Template</label>
                                        <textarea value={q.templateCode} onChange={e => handleQuestionChange(qIndex, 'templateCode', e.target.value)} rows="5" className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm bg-gray-900 text-green-300"></textarea>
                                    </div>
                                    <h5 className="font-semibold text-gray-600 mb-2">Casos de Teste</h5>
                                    {q.testCases.map((tc, tIndex) => (
                                        <div key={tIndex} className="flex items-center gap-3 mb-2 p-3 bg-white rounded border">
                                            <input type="text" value={tc.input} onChange={e => handleTestCaseChange(qIndex, tIndex, 'input', e.target.value)} placeholder="Entrada (Input)" className="flex-grow p-2 border border-gray-300 rounded-md" />
                                            <input type="text" value={tc.expectedOutput} onChange={e => handleTestCaseChange(qIndex, tIndex, 'expectedOutput', e.target.value)} placeholder="Saída Esperada (Output)" className="flex-grow p-2 border border-gray-300 rounded-md" />
                                            <button onClick={() => removeTestCase(qIndex, tIndex)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addTestCase(qIndex)} className="mt-2 text-sm text-indigo-600 hover:underline">+ Adicionar Caso de Teste</button>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="flex gap-4 mt-6">
                        <button onClick={() => addQuestion('multiple-choice')} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Adicionar Questão Teórica</button>
                        <button onClick={() => addQuestion('coding')} className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">Adicionar Desafio de Código</button>
                    </div>

                    <div className="mt-10 border-t pt-6 text-right">
                        <button onClick={saveQuiz} disabled={loading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
                            {loading ? 'Salvando...' : 'Salvar Quiz'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- TELA DE VISUALIZAÇÃO DE QUIZ E INÍCIO DE SESSÃO ---

function QuizDetail({ quizId, user, onBack, onStartSession }) {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/quizzes`, quizId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setQuiz({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [quizId, user.uid]);

    if (loading) return <Spinner />;
    if (!quiz) return <p className="text-center text-red-500 mt-8">Quiz não encontrado.</p>;

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline">
                    <ArrowLeft size={20} />
                    Voltar para o Dashboard
                </button>
                <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900">{quiz.title}</h2>
                            <p className="mt-2 text-lg text-gray-600">{quiz.description}</p>
                        </div>
                        <button onClick={() => onStartSession(quizId)} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 whitespace-nowrap">
                            <Play size={20} />
                            Iniciar Jogo
                        </button>
                    </div>

                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">{quiz.questions.length} Questões</h3>
                        <ul className="space-y-4">
                            {quiz.questions.map((q, index) => (
                                <li key={q.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <p className="font-semibold text-gray-800">
                                        {index + 1}. {q.text}
                                    </p>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${q.type === 'multiple-choice' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {q.type === 'multiple-choice' ? 'Múltipla Escolha' : 'Desafio de Código'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- LÓGICA DO JOGO (PROFESSOR E ALUNO) ---

// Lobby (Sala de Espera)
function GameLobby({ session, isHost, onStartGame }) {
    const joinCode = session?.joinCode;
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-indigo-600 text-white p-4">
            <div className="text-center">
                <p className="text-2xl font-semibold mb-2">Código da Sala:</p>
                <div className="bg-white text-indigo-800 font-extrabold text-5xl tracking-widest py-4 px-8 rounded-lg shadow-2xl mb-8">
                    {joinCode}
                </div>
                <div className="bg-white/20 p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Users size={28} /> Jogadores na Sala</h3>
                    <ul className="space-y-2 text-lg text-left">
                        {session.players?.length > 0 ? session.players.map(p => (
                            <li key={p.userId} className="bg-white/25 px-4 py-2 rounded-md font-semibold">{p.nickname}</li>
                        )) : <p className="text-center italic">Aguardando jogadores...</p>}
                    </ul>
                </div>
                {isHost && (
                    <button onClick={onStartGame} disabled={!session.players || session.players.length === 0} className="mt-8 bg-green-500 text-white font-bold text-2xl py-4 px-12 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg">
                        Começar Jogo!
                    </button>
                )}
            </div>
        </div>
    );
}

// Tela de Jogo principal
function GameScreen({ session, quiz, user, isHost, onNextQuestion, onEndGame }) {
    const [answer, setAnswer] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [code, setCode] = useState('');

    const currentQuestionIndex = session.currentQuestion;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= quiz.questions.length;

    // Reset state when question changes
    useEffect(() => {
        setAnswer(null);
        setSubmitted(false);
        if (currentQuestion?.type === 'coding') {
            setCode(currentQuestion.templateCode || '');
        }
    }, [currentQuestion]);

    const submitAnswer = async () => {
        if (submitted) return;
        setSubmitted(true);
        const submissionData = {
            sessionId: session.id,
            quizId: quiz.id,
            questionId: currentQuestion.id,
            userId: user.uid,
            nickname: session.players.find(p => p.userId === user.uid).nickname,
            submittedAt: serverTimestamp(),
        };

        if (currentQuestion.type === 'multiple-choice') {
            submissionData.answerIndex = answer;
            submissionData.isCorrect = answer === currentQuestion.correctAnswerIndex;
        } else {
            // Mock code evaluation
            submissionData.submittedCode = code;
            submissionData.isCorrect = Math.random() > 0.3; // Simulação de correção
        }

        await addDoc(collection(db, `artifacts/${appId}/public/data/gameSessions/${session.id}/submissions`), submissionData);
    };

    if (isFinished) {
        return <ResultsScreen session={session} isHost={isHost} onEndGame={onEndGame} />;
    }

    if (!currentQuestion) return <div className="bg-gray-800 text-white h-screen flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="bg-gray-800 text-white min-h-screen flex flex-col p-4">
            <div className="flex-grow flex flex-col items-center justify-center">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">{currentQuestion.text}</h2>

                {currentQuestion.type === 'multiple-choice' ? (
                    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => { if (!submitted) setAnswer(index); }}
                                disabled={submitted}
                                className={`p-6 rounded-lg text-xl font-bold transition-all duration-200 ${answer === index ? 'ring-4 ring-white' : ''
                                    } ${submitted && currentQuestion.correctAnswerIndex === index ? 'bg-green-500' :
                                        submitted && answer === index ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="w-full max-w-4xl">
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            disabled={submitted}
                            className="w-full h-64 p-4 border-2 border-gray-600 rounded-md font-mono text-sm bg-gray-900 text-green-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                )}

                {!isHost && !submitted && (
                    <button onClick={submitAnswer} className="mt-8 bg-green-500 text-white font-bold py-3 px-10 rounded-lg hover:bg-green-600 transition-colors text-xl">
                        Enviar Resposta
                    </button>
                )}
                {!isHost && submitted && (
                    <p className="mt-8 text-xl text-yellow-300">Resposta enviada! Aguardando o professor...</p>
                )}
            </div>

            {isHost && (
                <div className="fixed bottom-0 left-0 right-0 bg-black/50 p-4 text-center">
                    <button onClick={onNextQuestion} className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700 transition-colors text-xl">
                        Próxima Questão
                    </button>
                </div>
            )}
        </div>
    );
}

function ResultsScreen({ session, isHost, onEndGame }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = collection(db, `artifacts/${appId}/public/data/gameSessions/${session.id}/submissions`);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subs = [];
            snapshot.forEach(doc => subs.push(doc.data()));
            setSubmissions(subs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [session.id]);

    const leaderboard = useMemo(() => {
        if (!submissions || submissions.length === 0) return session.players.map(p => ({ ...p, score: 0 }));

        const scores = submissions.reduce((acc, sub) => {
            if (sub.isCorrect) {
                acc[sub.userId] = (acc[sub.userId] || 0) + 100; // Pontuação simples
            }
            return acc;
        }, {});

        const finalScores = session.players.map(player => ({
            ...player,
            score: scores[player.userId] || 0
        }));

        return finalScores.sort((a, b) => b.score - a.score);

    }, [submissions, session.players]);

    if (loading) return <div className="bg-gray-800 text-white h-screen flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-700 to-purple-800 text-white p-4">
            <h1 className="text-6xl font-extrabold tracking-tighter mb-8 text-yellow-300">Fim de Jogo!</h1>
            <div className="w-full max-w-lg bg-white/20 p-6 rounded-lg shadow-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center">Placar Final</h2>
                <ul className="space-y-3">
                    {leaderboard.map((player, index) => (
                        <li key={player.userId} className="flex justify-between items-center bg-white/10 p-4 rounded-lg text-lg">
                            <span className="font-bold">{index + 1}. {player.nickname}</span>
                            <span className="font-semibold text-yellow-300">{player.score} pts</span>
                        </li>
                    ))}
                </ul>
            </div>
            {isHost && (
                <button onClick={onEndGame} className="mt-10 bg-red-600 text-white font-bold text-xl py-3 px-8 rounded-lg hover:bg-red-700 transition-colors shadow-lg">
                    Finalizar e Voltar ao Início
                </button>
            )}
            {!isHost && (
                <p className="mt-10 text-xl">Obrigado por jogar!</p>
            )}
        </div>
    );
}


// --- COMPONENTE PRINCIPAL DO APP ---

export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('auth'); // auth, dashboard, createQuiz, quizDetail, joinLobby, game
    const [currentQuizId, setCurrentQuizId] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [quizData, setQuizData] = useState(null);

    const isHost = useMemo(() => {
        return currentSession?.hostId === user?.uid;
    }, [currentSession, user]);

    // Listener da sessão de jogo
    useEffect(() => {
        if (!currentSessionId) {
            setCurrentSession(null);
            setQuizData(null);
            return;
        }

        const sessionRef = doc(db, `artifacts/${appId}/public/data/gameSessions`, currentSessionId);
        const unsubscribe = onSnapshot(sessionRef, async (docSnap) => {
            if (docSnap.exists()) {
                const sessionData = { id: docSnap.id, ...docSnap.data() };
                setCurrentSession(sessionData);

                // Carrega dados do quiz se ainda não estiverem carregados
                if (!quizData || quizData.id !== sessionData.quizId) {
                    const quizRef = doc(db, `artifacts/${appId}/users/${sessionData.hostId}/quizzes`, sessionData.quizId);
                    const quizSnap = await getDoc(quizRef);
                    if (quizSnap.exists()) {
                        setQuizData({ id: quizSnap.id, ...quizSnap.data() });
                    }
                }
            } else {
                alert("Sessão de jogo não encontrada ou encerrada.");
                setPage('dashboard');
                setCurrentSessionId(null);
            }
        });

        return () => unsubscribe();
    }, [currentSessionId, quizData]);

    const handleAuthSuccess = (authenticatedUser) => {
        setUser(authenticatedUser);
        setPage('dashboard');
    };

    const handleCreateQuiz = () => {
        setCurrentQuizId(null);
        setPage('createQuiz');
    };

    const handleSelectQuiz = (quizId) => {
        setCurrentQuizId(quizId);
        setPage('quizDetail');
    };

    const handleEditQuiz = (quizId) => {
        setCurrentQuizId(quizId);
        setPage('createQuiz');
    };

    const handleStartSession = async (quizId) => {
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sessionData = {
            quizId,
            hostId: user.uid,
            joinCode,
            status: 'waiting', // waiting, in-progress, finished
            players: [],
            currentQuestion: 0,
            createdAt: serverTimestamp()
        };
        const sessionRef = await addDoc(collection(db, `artifacts/${appId}/public/data/gameSessions`), sessionData);
        setCurrentSessionId(sessionRef.id);
        setPage('joinLobby');
    };

    const handleJoinSession = async (joinCode) => {
        const q = query(collection(db, `artifacts/${appId}/public/data/gameSessions`), where("joinCode", "==", joinCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Código da sala inválido!");
            return;
        }

        const sessionDoc = querySnapshot.docs[0];
        const sessionId = sessionDoc.id;
        const sessionData = sessionDoc.data();

        let nickname = prompt("Digite seu apelido:");
        if (!nickname) return;

        const newPlayer = {
            userId: user.uid,
            nickname
        };

        const updatedPlayers = [...sessionData.players, newPlayer];
        await updateDoc(doc(db, `artifacts/${appId}/public/data/gameSessions`, sessionId), { players: updatedPlayers });

        setCurrentSessionId(sessionId);
        if (sessionData.status === 'waiting') {
            setPage('joinLobby');
        } else {
            setPage('game');
        }
    };

    const handleStartGame = async () => {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/gameSessions`, currentSessionId), { status: 'in-progress' });
        setPage('game');
    };

    const handleNextQuestion = async () => {
        const nextQuestionIndex = (currentSession.currentQuestion || 0) + 1;
        await updateDoc(doc(db, `artifacts/${appId}/public/data/gameSessions`, currentSessionId), { currentQuestion: nextQuestionIndex });
    };

    const handleEndGame = () => {
        setPage('dashboard');
        setCurrentSessionId(null);
        setCurrentQuizId(null);
    };


    const renderPage = () => {
        switch (page) {
            case 'auth':
                return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
            case 'dashboard':
                return <TeacherDashboard user={user} onCreateQuiz={handleCreateQuiz} onSelectQuiz={handleSelectQuiz} onJoinSession={handleJoinSession} />;
            case 'createQuiz':
                return <QuizEditor quizId={currentQuizId} user={user} onBack={() => setPage('dashboard')} />;
            case 'quizDetail':
                return <QuizDetail quizId={currentQuizId} user={user} onBack={() => setPage('dashboard')} onStartSession={handleStartSession} />;
            case 'joinLobby':
                return currentSession ? <GameLobby session={currentSession} isHost={isHost} onStartGame={handleStartGame} /> : <Spinner />;
            case 'game':
                if (currentSession && quizData) {
                    if (currentSession.status === 'waiting' && !isHost) {
                        return <GameLobby session={currentSession} isHost={isHost} />;
                    }
                    return <GameScreen session={currentSession} quiz={quizData} user={user} isHost={isHost} onNextQuestion={handleNextQuestion} onEndGame={handleEndGame} />
                }
                return <Spinner />;
            default:
                return <p>Página não encontrada</p>;
        }
    };

    return (
        <main className="bg-gray-50 min-h-screen font-sans">
            {page !== 'joinLobby' && page !== 'game' && <Header user={user} />}
            {renderPage()}
        </main>
    );
}

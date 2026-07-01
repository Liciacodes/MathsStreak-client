import axios from "axios";

const API_BASE_URL = 'https://quizstreak-api.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL
})

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
    }
}


export interface TodayQuizResponse {
    alreadyAnswered: boolean;
    question: string;
    questionId?: string;
    correctAnswer?: string;
    isCorrect?: boolean;
    streak?: number;
}

export interface SubmitAnswerResponse {
    isCorrect: boolean;
    correctAnswer: string;
    streak: number;
}

export const registerUser = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
    })
    return response.data
}

export const loginUser = async (
    email: string,
    password: string,
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
            email,
            password,
        })
        return response.data
};

export const getTodayQuiz = async (
    token: string

): Promise<TodayQuizResponse> => {
    const response = api.get<TodayQuizResponse>('/quiz/today', {
        headers: {Authorization: `Bearer ${token}`},
    })
    return (await response).data;
}

export const submitAnswer = async (
    token: string,
    answer: string
): Promise<SubmitAnswerResponse> => {
    const response = await api.post<SubmitAnswerResponse>('/quiz/submit',
        {answer},
        {headers: {Authorization: `Bearer ${token}`}}
    );
    return response.data;
}


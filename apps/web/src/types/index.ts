export interface User {
    id: string;
    email: string;
    created_at?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    completed: boolean;
    due_date: string | null;
    priority: Priority;
    created_at: string;
}

export interface Note {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

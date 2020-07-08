export type taskStatus = 'to_do' | 'in_progress' | 'done';

export interface Project {
    key: string // usually the first letters of words which are used in name
    lead: string;
    name: string
}

export interface Task {
    project_key: string;
    reporter: string; // the key of the user who reported task
    description: string;
    status: taskStatus;
    summary: string;
    sequence: number; // sequence of creation, it doesn't change if smth was removed
    assignee?: string; // the key of the user who assigned to do this task
}

export interface User {
    userId: string;
    email: string;
    full_name: string;
}

export interface SignUpUser extends User {
    password: string;
    confirmPassword: string;
}

export interface LogInUser {
    email: string;
    password: string;
}
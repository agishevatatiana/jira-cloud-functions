export interface Project {
    lead: string;
    name: string
}

export interface Task {
    project_key: string;
    reporter: string;
    description: string;
    status: string;
    summary: string;
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
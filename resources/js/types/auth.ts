export type User = {
    id: number;
    name: string | null;
    email: string | null;
    created_at: string | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type Flash = {
    success: string | null;
    error: string | null;
};

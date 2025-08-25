declare interface User {
    id: string;
    email: string;
    name: string;
    created_at: Date;
}
declare interface Session {
    id: string;
    user_id: string;
    created_at: Date;
}
declare interface Message {
    id: string;
    session_id: string;
    role: string;
    content: string;
    model: string|null;
    created_at: Date;
}
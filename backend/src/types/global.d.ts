declare type User {
    id: string;
    email: string;
    name: string;
    created_at: Date;
}
declare type Session {
    id: string;
    user_id: string;
    created_at: Date;
}
declare type Message {
    id: string;
    session_id: string;
    role: string;
    content: string;
    created_at: Date;
}
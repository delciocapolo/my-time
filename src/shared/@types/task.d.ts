export type Task = {
    id: number;
    description: string;
    is_completed: boolean;
    created_at?: Date | null;
    updated_at?: Date | null;
    deleted_at?: Date | null;
};

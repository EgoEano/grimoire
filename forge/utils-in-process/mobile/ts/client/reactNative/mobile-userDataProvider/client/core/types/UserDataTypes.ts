export type UserData = {
    id: number;
    user_id: string;
    username: string;
    avatar?: string | null;
    created_at: number;
    updated_at?: number | null;
};

export type UserDataSettings = {
    id: number;
    user_id: number;
    theme: number;
    font_size: number;
    language: number;
    is_notifications_active: boolean;
    created_at: number;
    updated_at?: number | null;
};

export type NewUserData = Omit<UserData, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserData = Partial<Omit<UserData, 'id' | 'user_id' | 'created_at'>>;

export type NewUserDataSettings = Omit<UserDataSettings, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserDataSettings = Partial<Omit<UserDataSettings, 'id' | 'user_id' | 'created_at'>>;
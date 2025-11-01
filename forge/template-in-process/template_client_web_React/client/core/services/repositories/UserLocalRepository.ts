import { DBSQLiteConnection } from "../connection/dbFactory";
import { USER_DATA_TABLE_DEFINITIONS, USER_DATA_DATA_DEFINITIONS } from "../connection/sysMigrations";
import type { UserData } from "../auth/authService";


export class UserLocalRepository {
    public db: DBSQLiteConnection;
    private initialized = false; 
    private static dbName: string = "user_data.db";

    constructor() {
        this.db = new DBSQLiteConnection({name: UserLocalRepository.dbName});
    }

    async init(): Promise<void> {
        //await this.db.dropDB();
        await this.db.init();
        await this.db.initDBData({
            // schemas: migration?.schemas,
            tables: USER_DATA_TABLE_DEFINITIONS,
            // views: migration?.views,
            // triggers: migration?.triggers,
            // indexes: migration?.indexes,
            data: USER_DATA_DATA_DEFINITIONS,
        });
        this.initialized = true;
    }

    async ensureInit() {
        if (!this.initialized) await this.init();
      }

    async close(): Promise<void> {
        await this.db.closeDB();
    }

    // Создать пользователя
    async createUser(user: UserData): Promise<boolean> {
        await this.ensureInit();
        const { user_id, username, email, avatar } = user;
        const res = await this.db.tx({
            query: `
                INSERT INTO users (user_id, username, email, avatar, created_at)
                VALUES (?, ?, ?, ?, ?)
            `,
            args: [user_id, username, email, avatar, Date.now()]
        });
        return (res.success && Array.isArray(res.result) && !!res.result[0]?.insertId);
    }

    // Прочитать пользователя по user_id
    async getUserById(user_id: string): Promise<UserData | null> {
        await this.ensureInit();
        const res = await this.db.tx({
            query: `
                SELECT * FROM users WHERE user_id = ?
            `,
            args: [user_id]
        });

        if (res.success && res.result && res.result.length > 0) {
            const usr: UserData | null = res.result[0].rows[0];
            return usr;
        } else
        return null;
    }

    // Обновить пользователя
    async updateUser(id: number, updates: Partial<Omit<UserData, "id">>): Promise<boolean> {
        await this.ensureInit();
        const fields = [];
        const values = [];
        for (const key in updates) {
            fields.push(`${key} = ?`);
            // @ts-ignore
            values.push(updates[key]);
        }
        if (fields.length === 0) return false;
        values.push(id);
        const res = await this.db.tx({
            query: `
                UPDATE users SET ${fields.join(", ")} WHERE id = ?
            `,
            args: values
        });
        return !!res.success;
    }

    //не дописано
    // Удалить пользователя
    async deleteUser(id: number): Promise<boolean> {
        await this.ensureInit();
        const res = await this.db.tx({
            query: `
                DELETE FROM users WHERE id = ?
            `,
            args: [id]
        });
        return !!res.success;
    }
}
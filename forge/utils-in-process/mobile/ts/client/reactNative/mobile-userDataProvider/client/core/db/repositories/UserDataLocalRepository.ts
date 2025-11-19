import { DBSQLiteConnection } from "../../services/connection/dbFactory";
import { tables, data } from "../schema/UserDataMigrations";

import type { NewUserData, NewUserDataSettings, UpdateUserDataSettings, UserData, UserDataSettings } from "../../types/UserDataTypes";


export class UserLocalRepository {
    public db: DBSQLiteConnection;
    private initialized = false; 
    private static dbName: string = "user_data.db";

    constructor() {
        this.db = new DBSQLiteConnection({name: UserLocalRepository.dbName});
    }

    async init(): Promise<void> {
        //await this.db.dropDB(); //Use in dev cases
        await this.db.init();
        await this.db.initDBData({
            tables: tables,
            data: data,
        });
        this.initialized = true;
    }

    async ensureInit() {
        if (!this.initialized) await this.init();
      }

    async close(): Promise<void> {
        await this.db.closeDB();
    }

    //#region User
    // create
    async createUser(user: NewUserData): Promise<number | null> {
        await this.ensureInit();
        const { user_id, username, avatar } = user;
        const res = await this.db.tx({
            query: `
                INSERT INTO users (user_id, username, avatar)
                VALUES (?, ?, ?)
            `,
            args: [user_id, username, avatar ?? null]
        });

        if (res.success && res.result?.[0]?.insertId) {
            return res.result[0].insertId;
        }
        return null;
    }

    // read
    async getUserByUserId(user_id: string): Promise<UserData | null> {
        await this.ensureInit();
        const res = await this.db.tx({
            query: `
                SELECT * FROM users WHERE user_id = ?
            `,
            args: [user_id]
        });

        if (res.success && res.result && res.result.length > 0) {
            return res.result[0].rows[0] ?? null;
        }
        return null;
    }

    // update
    async updateUser(user_id: string, updates: Partial<Omit<UserData, "id">>): Promise<boolean> {
        await this.ensureInit();
        const fields: string[] = [];
        const values: any[] = [];

        for (const key in updates) {
            fields.push(`${key} = ?`);
            values.push((updates as any)[key]);
        }

        if (fields.length === 0) return false;

        values.push(user_id);
        const res = await this.db.tx({
            query: `
                UPDATE users SET ${fields.join(", ")} WHERE user_id = ?
            `,
            args: values
        });
        return !!res.success;
    }

    // delete
    async deleteUser(user_id: string): Promise<boolean> {
        await this.ensureInit();
        const res = await this.db.tx({
            query: `
                DELETE FROM users WHERE user_id = ?
            `,
            args: [user_id]
        });
        return !!res.success;
    }
    //#endregion


    //#region UserSettings
    async createUserSettings(settings: NewUserDataSettings): Promise<boolean> {
        await this.ensureInit();
        const { user_id, theme, font_size, language, is_notifications_active } = settings;

        const res = await this.db.tx({
            query: `
                INSERT OR REPLACE INTO user_settings 
                (user_id, theme, font_size, language, is_notifications_active, created_at)
                VALUES (?, ?, ?, ?, ?, strftime('%s','now'))
            `,
            args: [user_id, theme, font_size, language, is_notifications_active]
        });

        return !!res.success;
    }

    async getUserSettings(user_id: number): Promise<UserDataSettings | null> {
        await this.ensureInit();
        const res = await this.db.tx({
            query: `SELECT * FROM user_settings WHERE user_id = ?`,
            args: [user_id]
        });

        const rows = res.result?.[0]?.rows ?? [];
        return rows.length ? (rows[0] as UserDataSettings) : null;
    }

    async updateUserSettings(user_id: number, updates: UpdateUserDataSettings): Promise<boolean> {
        await this.ensureInit();
        const fields: string[] = [];
        const values: any[] = [];

        for (const key in updates) {
            fields.push(`${key} = ?`);
            values.push((updates as any)[key]);
        }

        if (fields.length === 0) return false;
        values.push(user_id);

        const res = await this.db.tx({
            query: `
                UPDATE user_settings 
                SET ${fields.join(", ")}, updated_at = strftime('%s','now') 
                WHERE user_id = ?
            `,
            args: values
        });

        return !!res.success;
    }

    async deleteUserSettings(user_id: number): Promise<boolean> {
        await this.ensureInit();
        const res = await this.db.tx({
            query: `
                DELETE FROM user_settings WHERE user_id = ?
            `,
            args: [user_id]
        });
        return !!res.success;
    }

    async resetUserSettings(user_id: number): Promise<boolean> {
        await this.ensureInit();
        // Default values is setted in migration file: theme=1, font_size=2, language=1, is_notifications_active=1
        const res = await this.db.tx({
            query: `
                UPDATE user_settings 
                SET
                    theme = 1,
                    font_size = 2,
                    language = 1,
                    is_notifications_active = 1,
                    updated_at = strftime('%s','now')
                WHERE user_id = ?
            `,
            args: [user_id]
        });

        return !!res.success;
    }
    //#endregion


}
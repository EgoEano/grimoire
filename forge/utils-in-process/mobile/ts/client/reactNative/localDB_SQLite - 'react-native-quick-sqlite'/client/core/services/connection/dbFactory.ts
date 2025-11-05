import { open, QueryResult, QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

import type {
    DBOptions,
    DropDBResult,
    InitDBQueries,
    SQLQuery,
    ParsedResultSet,
    TxResult
} from '../../types/SQLiteTypes';

export class DBSQLiteConnection {
    private dbName: string;
    private instance: QuickSQLiteConnection | null;

    constructor({ name }: DBOptions) {
        if (!name) throw new Error('Need to set database name in DBSQLiteConnection');
        this.dbName = name;
        this.instance = null;
    }

    async init(): Promise<void> {
        this.instance = open({ name: this.dbName });
        await this.tx({ query: 'PRAGMA foreign_keys = ON;' });
    }

    getDB(): QuickSQLiteConnection | null {
        if (!this.instance) throw new Error('Need to init DB before getting');
        return this.instance;
    }

    async initDBData({
        schemas, tables, views, triggers, indexes, data
    }: InitDBQueries): Promise<void> {
        if (schemas) await this.txs(schemas);
        if (tables) await this.txs(tables);
        if (views) await this.txs(views);
        if (triggers) await this.txs(triggers);
        if (indexes) await this.txs(indexes);
        if (data) await this.txs(data);
    }

    async tx({ query, args = [] }: SQLQuery): Promise<TxResult> {
        return this.txs([{ query, args }]);
    }

    async txs(queries: SQLQuery[]): Promise<TxResult> {
        if (!this.instance) {
            return {
                success: false,
                errors: ['Need to init DB before making transactions']
            };
        }

        try {
            const result: ParsedResultSet[] = [];

            for (const { query, args } of queries) {
                const res = this.instance.execute(query, args);
                result.push(this.parseResultSet(res));
            }

            return { success: true, result };
        } catch (e: any) {
            console.error('SQLite transaction error', e);
            return {
                success: false,
                errors: [e.message ?? String(e)]
            };
        }
    }

    parseResultSet(set: QueryResult): ParsedResultSet {
        let rows: any[] = [];

        if (Array.isArray(set.rows)) {
            rows = set.rows;
        } else if (set.rows?._array) {
            rows = set.rows._array;
        } else if (typeof set.rows?.item === 'function') {
            for (let i = 0; i < set.rows.length; i++) {
                rows.push(set.rows.item(i));
            }
        }
        return {
            insertId: set.insertId ?? null,
            rowsAffected: set.rowsAffected ?? 0,
            rows
        };
    }

    async dropDB(): Promise<DropDBResult> {
        if (!this.instance) {
            return { isSuccess: false, errors: 'DB is not initialized' };
        }
        try {
            this.closeDB();
            const path =
                Platform.OS === 'android'
                ? `${RNFS.DocumentDirectoryPath}/../databases/${this.dbName}`
                : `${RNFS.LibraryDirectoryPath}/LocalDatabase/${this.dbName}`;
      
            const exists = await RNFS.exists(path);
            if (exists) {
                await RNFS.unlink(path);
                console.log(`Database '${this.dbName}' deleted successfully.`);
            } else {
                console.log(`Database '${this.dbName}' not found at: ${path}`);
            }

            return { isSuccess: true, errors: null };
        } catch (e: any) {
            console.error('DB deletion error', e);
            return { isSuccess: false, errors: e.message };
        }
    }

    closeDB() {
        this.instance?.close();
        this.instance = null;
    }

    async healthCheck(): Promise<TxResult> {
        if (!this.instance) {
            return {
                success: false,
                errors: ['Need to init DB before make transactions']
            };
        }

        try {
            this.instance.execute('SELECT 1;');
            return { success: true };
        } catch (e: any) {
            console.error('DB health check failed', e);
            return {
                success: false,
                errors: ['There was a problem establishing a connection']
            };
        }
    }
}

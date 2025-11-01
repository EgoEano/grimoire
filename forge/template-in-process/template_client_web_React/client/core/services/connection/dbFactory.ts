// database/dbFactory.ts
import SQLite, { SQLiteDatabase, ResultSet, Transaction } from 'react-native-sqlite-storage';
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
    private dbLocation: 'default' | 'Library' | 'Documents' | null;
    private dbCreateFromLocation: string | undefined;
    private instance: SQLiteDatabase | null;

    constructor({
        name, location = 'default', createFromLocation = undefined
    }: DBOptions) {
        if (!name) throw new Error('Need to set database name in DBSQLiteConnection');
        
        this.dbName = name;
        this.dbLocation = location;
        this.dbCreateFromLocation = createFromLocation ?? undefined;

        this.instance = null;
        SQLite.enablePromise(true);
    }

    async init(): Promise<void> {
        this.instance = await this.ensureCreateDatabase({ 
            name: this.dbName,
            location: this.dbLocation,
            createFromLocation: this.dbCreateFromLocation
        });
        await this.tx({
            query: 'PRAGMA foreign_keys = ON;', 
            args: []
        });
    }

    getDB(): SQLiteDatabase | null {
        if (!this.instance) new Error('Need to init DB before getting');
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

    async ensureCreateDatabase({
        name, location, createFromLocation
    }: DBOptions): Promise<SQLiteDatabase> {
        try {
            return await SQLite.openDatabase({
                name: name,
                location: location ?? 'default',
                createFromLocation: createFromLocation ?? undefined,
            });
        } catch (e) {
            throw new Error(`Cannot connect with '${name}' DB`);
        }
    }

    async tx(
        {query, args}: SQLQuery
    ): Promise<TxResult> {
        return await this.txs([{query, args}]);
    }

    async txs(queries: SQLQuery[]): Promise<TxResult> {
        if (!this.instance) {
            return {
                success: false,
                errors: ['Need to init DB before making transactions']
            };
        }

        const result: ParsedResultSet[] = [];

        return new Promise<TxResult>((resolve, reject) => {
            try {
                this.instance?.transaction(
                    tx => {
                        for (const { query, args } of queries) {
                            tx.executeSql(
                                query, 
                                args ?? [],
                                    (_, resultSet) => {
                                        result.push(this.parseResultSet(resultSet));
                                    },
                                    (_, error) => {
                                        console.warn('SQLite executeSql error. ' + error.message);
                                        reject({
                                            success: false,
                                            errors: [
                                                `Query failed: ${query}`,
                                                error.message
                                            ]
                                        });
                                        return true;
                                    }

                            )
                        }
                    },
                    error => {
                        console.warn('SQLite transaction error. ' + error.message);
                        reject({
                            success: false,
                            errors: ['Transaction error', error.message],
                        });
                    },
                    () => {
                        resolve({
                            success: true,
                            result,
                        });
                    }
                );
            } catch (e: any) {
                reject({
                    success: false,
                    errors: [
                        'Fatal error in transaction block',
                        e?.message ?? String(e)
                    ]
                });
            }
        });
    }

    parseResultSet(set: ResultSet): ParsedResultSet {
        const rows = [];
        for (let i = 0; i < set.rows.length; i++) {
            rows.push(set.rows.item(i));
        }
        return {
            insertId: set.insertId ,
            rowsAffected: set.rowsAffected,
            rows
        };
    }

    async dropDB(): Promise<DropDBResult> {
        if (!this.instance || !this.dbName) {
            return {isSuccess: false, errors: 'DB is not initialized'};
        }
        let err: SQLite.SQLError | null = null;
        try {
            await this.closeDB();
            SQLite.deleteDatabase(
                { 
                    name: this.dbName,
                    location: this.dbLocation ?? 'default',
                    createFromLocation: this.dbCreateFromLocation ?? undefined
                },
                () => null,
                (error) => err = error
            );
        } catch (e) {
            console.error(`DB deletion error with '${this.dbName}'`);
        }
        return {isSuccess: err == null, errors: err};
    }

    async closeDB() {
        await this.instance?.close();
    }

    async healthCheck(): Promise<TxResult> {

        if (!this.instance) {
            return {
                success: false,
                errors: ['Need to init DB before make transactions']
            }
        };

        return new Promise((resolve) => {
            this.instance?.executeSql('SELECT 1;', [], 
            () => resolve({success: true}),
            (error) => {
                console.error('DB health check failed', error);
                resolve({
                    success: false,
                    errors: ['There was a problem establishing a connection']
                });
            }
            );
        });
    }
}



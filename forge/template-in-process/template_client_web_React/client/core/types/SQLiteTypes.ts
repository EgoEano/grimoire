import { SQLError, ResultSet } from 'react-native-sqlite-storage';

export type DBOptions = {
    name: string;
    location?: 'default' | 'Library' | 'Documents' | null; // iOS
    createFromLocation?: string | null;
};

export type DropDBResult = {
    isSuccess: boolean;
    errors: SQLError | string | null;
};

export type InitDBQueries = {
    schemas?: SQLQuery[];
    tables?: SQLQuery[];
    views?: SQLQuery[];
    triggers?: SQLQuery[];
    indexes?: SQLQuery[];
    data?: SQLQuery[];
};

export type SQLQuery = {
    query: string;
    args?: any[];
};

export type ParsedResultSet = {
    insertId: number;
    rowsAffected: number;
    rows: any[];
    errors?: string[];
};

export type TxResult  = {
    success: boolean;
    result?: ParsedResultSet[] | null;
    errors?: string[] | null;
};

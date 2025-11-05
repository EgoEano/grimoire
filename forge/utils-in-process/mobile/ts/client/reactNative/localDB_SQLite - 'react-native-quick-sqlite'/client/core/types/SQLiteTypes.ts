export type DBOptions = {
    name: string;
};

export type DropDBResult = {
    isSuccess: boolean;
    errors: Error | string | null;
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
    insertId?: number | null
    rowsAffected: number
    rows: any[];
    errors?: string[];
};

export type TxResult = {
    success: boolean;
    result?: ParsedResultSet[] | null;
    errors?: string[] | null;
};

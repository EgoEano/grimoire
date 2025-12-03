export type OperationResult = {
    success: boolean;
    data?: any | null;
    message?: string | null;
    code?: number | null, 
    errors?: string[] | null;
};

export function createOperationResult({
    success, 
    data = null, 
    message = null, 
    code = null, 
    errors = null
}: OperationResult) {
    return { 
        success, 
        data, 
        message, 
        code,
        errors: Array.isArray(errors) ? errors : (errors ? [errors] : []),
    };
}

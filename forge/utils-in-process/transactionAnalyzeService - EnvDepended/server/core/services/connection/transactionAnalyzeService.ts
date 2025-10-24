import axios, { AxiosResponse } from 'axios';
import Logger from '../../middleware/loggers/loggerService.js';
import { parseQueryString, getValueByPath } from '../utils/parsers.js';

export interface TransactionDetails {
    hash?: string;
    blockNumber?: string;
    timeStamp?: string;
    from?: string;
    to?: string;
    value?: string;
    [key: string]: any;
}

export async function getTransactionDetails(address: string): Promise<TransactionDetails[] | undefined> {
    const baseUrl = process.env.API_TRANSSCAN_URL;
    const keyName = process.env.API_TRANSSCAN_KEY_NAME;
    const keyValue = process.env.API_TRANSSCAN_KEY_VALUE;
    const staticParams = parseQueryString(process.env.API_TRANSSCAN_STATIC_PARAMS || '');
    const resultPath = process.env.API_TRANSSCAN_RESULT_PATH;

    // Проверка обязательных параметров
    if (!address || !baseUrl || !keyName || !keyValue || !resultPath) {
        throw new Error('Missing required ENV configuration for transaction details fetching');
    }

    const fullParams = {
        ...staticParams,
        address,
        [keyName]: keyValue,
    };

    try {
        const res: AxiosResponse = await axios.get(baseUrl, { params: fullParams });

        const values = getValueByPath(res.data, resultPath);

        if (!values) {
            Logger.error({
                msg: 'Failed to parse transaction details: path not found',
                path: resultPath,
                preview: JSON.stringify(res.data).slice(0, 300),
            });
            return undefined;
        }

        const transactions = Array.isArray(values) ? values : [values];

        Logger.info({
            msg: `Fetched ${transactions.length} transactions for address ${address}`,
        });

        return transactions as TransactionDetails[];

    } catch (err: any) {
        Logger.error({
            msg: 'Failed to fetch transaction details',
            address,
            error: err.message,
        });
        return undefined;
    }
}


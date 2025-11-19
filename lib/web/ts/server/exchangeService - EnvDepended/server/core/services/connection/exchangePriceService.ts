// v1.0.0

import axios, { AxiosResponse } from 'axios';
import { redisClient } from '../connection/redisService.js';
import Logger from '../../middleware/loggers/loggerService.js';
import { createServiceResponse } from '../responses/typedResponses.js';
import { parseQueryString, getValueByPath } from '../utils/parsers.js';


export interface ExchangeRates {
    USDT: number;
    NOOR: number;
    BTC: number;
    ETH: number;
}

export interface ExternalExchangeResponse {
    ethusd: string;
    ethbtc: string;
    [key: string]: string | number;
}

interface ServiceResponse<T> {
    success: boolean;
    data: T;
}

const DEFAULT_RATES: ExchangeRates = {
    USDT: 1,
    NOOR: 10,
    BTC: 0.0000094,
    ETH: 0.00039,
};

const DEFAULT_CACHE_TTL = 60; // seconds


export async function getExchangeRate(): Promise<ServiceResponse<ExchangeRates>> {
    const rates: ExchangeRates = { ...DEFAULT_RATES };

    try {
        const exchangeRates = await getExchangePrice();

        if (exchangeRates) {
            const ethUsd = parseFloat(exchangeRates.ethusd);
            const ethBtc = parseFloat(exchangeRates.ethbtc);

            if (isNaN(ethUsd) || isNaN(ethBtc) || ethUsd <= 0) {
                Logger.warn({ msg: 'Invalid exchange rate values received', exchangeRates });
                return createServiceResponse({ success: false, data: rates });
            }

            rates.ETH = 1 / ethUsd;
            rates.BTC = ethBtc / ethUsd;

            return createServiceResponse({ success: true, data: rates });
        } else {
            Logger.warn({ msg: 'Exchange rates not available, using default rates' });
            return createServiceResponse({ success: false, data: rates });
        }
    } catch (err) {
        Logger.error({ msg: 'Unexpected error in getExchangeRate', err });
        return createServiceResponse({ success: false, data: rates });
    }
}


export async function getExchangePrice(): Promise<ExternalExchangeResponse | undefined> {
    const cacheKey = process.env.API_EXCHANGE_PRICE_CACHE_KEY;
    const ttl = parseInt(process.env.API_EXCHANGE_CACHE_TTL || `${DEFAULT_CACHE_TTL}`, 10);
    const baseUrl = process.env.API_EXCHANGE_URL;
    const keyName = process.env.API_EXCHANGE_KEY_NAME;
    const keyValue = process.env.API_EXCHANGE_KEY_VALUE;
    const EthPricesPath = process.env.API_EXCHANGE_RESULT_PATH;
    const staticParams = parseQueryString(process.env.API_EXCHANGE_STATIC_PARAMS || '');

    if (!cacheKey || !baseUrl || !keyName || !keyValue || !EthPricesPath) {
        throw new Error('Missing required ENV configuration for exchange price fetching');
    }

    const fullParams = {
        ...staticParams,
        [keyName]: keyValue,
    };

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            Logger.info({ msg: `Using cached exchange data [${cacheKey}]` });
            return JSON.parse(cached) as ExternalExchangeResponse;
        }

        const res: AxiosResponse = await axios.get(baseUrl, { params: fullParams });

        const priceValues = getValueByPath(res.data, EthPricesPath);

        if (!priceValues || typeof priceValues !== 'object') {
            Logger.error({
                msg: 'Failed to parse prices from fetch',
                dataPreview: JSON.stringify(res.data).slice(0, 300),
            });
            return undefined;
        }

        if (!('ethusd' in priceValues) || !('ethbtc' in priceValues)) {
            Logger.error({
                msg: 'Response missing required fields (ethusd / ethbtc)',
                receivedKeys: Object.keys(priceValues),
            });
            return undefined;
        }

        await redisClient.setEx(cacheKey, ttl, JSON.stringify(priceValues));
        Logger.info({ msg: `Exchange rates cached for ${ttl}s`, cacheKey });

        return priceValues as ExternalExchangeResponse;

    } catch (err) {
        Logger.error({ msg: 'Failed to fetch ETH price', err });
        return undefined;
    }
}

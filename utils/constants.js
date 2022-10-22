/**
 * The base url for the CoinGecko API
 */
 const BASE = 'https://api.coingecko.com/api/';

 /**
  * The host of the CoinGecko API
  */
 const HOST = 'api.coingecko.com';
 
 /**
  * The current version for the CoinGecko API
  */
 const API_VERSION = '3';
 
 /**
  * The CoinGecko URI according to base and current version
  */
 const URI = `${BASE}v${API_VERSION}`;
 
 /**
  * The maximum number of requests per second for the CoinGecko API
  */
 const REQUESTS_PER_SECOND = 1;

 /**
 * Timeout for connecton to CoinGecko API in milliseconds (default: 30 seconds)
 */
const TIMEOUT = 30000

 module.exports = {
    BASE,
    HOST,
    API_VERSION,
    URI,
    REQUESTS_PER_SECOND,
    TIMEOUT,
};
  
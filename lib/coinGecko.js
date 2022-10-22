'use strict';

//Modules
const https = require('https');
const querystring = require('querystring');

//Utils
const helper = require('../utils/helper');
const constants = require('../utils/constants');

/**
 * @class CoinGecko
 * A Node.js wrapper for the CoinGecko API
 */
class CoinGecko {
   /**
   * Check API server status
   */
  health() {
    const path = `/ping`;

    return this.send_request(path);
  };


  get coins() {
    return {
        markets: (params = {}) => {
            const path = `/coins/markets`;

            this._preProcessing(params);

            return this.send_request(path, params);
        },
    }
  }

  _preProcessing(params){

    //Check if params is an object
    if (!helper.isObject(params)) helper._WARN_('Invalid parameter', 'params must be of type: Object');

    //If no params.vs_currency, set to default: 'usd'
    if (!helper.isString(params['vs_currency']) || helper.isStringEmpty(params['vs_currency'])) {
        params.vs_currency = 'usd';
    }

    //If no params.per_page, set to default: '100'
    if (!helper.isString(params['per_page']) || helper.isStringEmpty(params['per_page'])) {
        params.per_page = 100;
    }

    //If no params.order, set to default: 'market_cap_desc'
    if (!helper.isString(params['order']) || helper.isStringEmpty(params['order'])) {
        params.order = 'market_cap_desc';
    }

    //If no params.page, set to default: '1'
    if (!helper.isString(params['page']) || helper.isStringEmpty(params['page'])) {
        params.page = 1;
    }

    //If no params.sparkline, set to default: 'false'
    if (!helper.isString(params['sparkline']) || helper.isStringEmpty(params['sparkline'])) {
        params.sparkline = false;
    }

    return params
  }

  _addQueryParams(path, params) {
    //Stringify object params if exist
    if (helper.isObject(params)) params = querystring.stringify(params);
    else params = undefined;

    //Make relative path
    //Check if has params, append accordingly
    if (params == undefined) path = `/api/v${constants.API_VERSION}${path}`;
    else path = `/api/v${constants.API_VERSION}${path}?${params}`;

    //Return options
    return {
      path,
      method: 'GET',
      host: constants.HOST,
      port: 443,
      timeout: CoinGecko.TIMEOUT,
    };
  };

  send_request(path, params){
    let options = this._addQueryParams(path, params);

    return new Promise((resolve, reject) => {
      //Perform request
      console.log(options)
      let req = https.request(options, (res) => {
        let body = [];

        //Set body on data
        res.on('data', (chunk) => {
          body.push(chunk);
        });

        //On end, end the Promise
        res.on('end', () => {
          try {
            body = Buffer.concat(body);
            body = body.toString();

            //Check if page is returned instead of JSON
            if (body.startsWith('<!DOCTYPE html>')) {
              helper._WARN_('Invalid request', 'There was a problem with your request. The parameter(s) you gave are missing or incorrect.');
            } else if (body.startsWith('Throttled')) {
              helper._WARN_('Throttled request', 'There was a problem with request limit.');
            }

            //Attempt to parse
            body = JSON.parse(body);
          }
          catch (error) {
            reject(error);
          };

          const data = {
            "success": !(res.statusCode < 200 || res.statusCode >= 300),
            "message": res.statusMessage,
            "code": res.statusCode,
            "data": body
          }
          
          //Create return object
          resolve(data);
        });
      });

      //On error, reject the Promise
      req.on('error', (error) => reject(error));

      //On timeout, reject the Promise
      req.on('timeout', () => {
        req.abort();
        reject(new Error(`CoinGecko API request timed out. Current timeout is: ${CoinGecko.TIMEOUT} milliseconds`));
      });

      //End request
      req.end();
    });
  };
}

//Set Constants
CoinGecko.API_VERSION = constants.API_VERSION;
CoinGecko.REQUESTS_PER_SECOND = constants.REQUESTS_PER_SECOND;
CoinGecko.TIMEOUT = constants.TIMEOUT;

module.exports = CoinGecko;

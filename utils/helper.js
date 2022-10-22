const isString = (str) => {
  return (typeof str === 'string' || str instanceof String);
};

const isStringEmpty = (str) => {
  if (!isString(str)) return false;
  return (str.length == 0);
};

const isObject = (obj) => {
  if (isArray(obj)) return false;
  return (obj !== null && typeof obj === 'object');
};

const isArray = (arr) => {
  return Array.isArray(arr);
};

const _WARN_ = (title = '', detail = '') => {
  process.emitWarning(title, {
    detail,
    code: 'CoinGecko',
  });

  return true;
};

module.exports = {
  isString,
  isStringEmpty,
  isObject,
  isArray,
  _WARN_,
};
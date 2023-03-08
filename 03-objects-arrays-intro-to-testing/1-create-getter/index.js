/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const keys = path.split('.');
 
  return function(obj) {
    const retrievedValue = keys.reduce((ob, key) => {
      if (ob && ob[key]) {
        return ob[key];
      }
      return;
    },
    obj);
    return retrievedValue;
  };
}

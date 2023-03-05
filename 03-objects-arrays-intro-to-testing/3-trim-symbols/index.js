/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let count = 0;
  const arr = string.split('');
  const newArr = arr.map((char, i) => {
    const prev = arr[i - 1];
    if (prev && char !== prev) {
      count = 1;
    } else {
      count += 1;
    }
    if (count > size) {
      return '';
    }

    return char;
  });

  return newArr.join('');
}

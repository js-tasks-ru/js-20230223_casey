/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortedArr = [...arr];
  const checkAsc = {
    'asc': 1,
    'desc': -1,
  };

  let collator = new Intl.Collator(['ru', 'en'], { 
    caseFirst: "upper", 
    sensitivity: 'variant',
    localeMatcher: 'best fit',
  });
  return sortedArr.sort((a, b) => collator.compare(a, b) * checkAsc[param]);
}

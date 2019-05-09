/***
* Convert dash string to camelCase.
* @param {string} str - String to convert.
* @returns {string} Converted string.
*/
export function camelize (str) {
  return str.replace(/-([a-z0-9])/g, match => match[1].toUpperCase())
}

/***
* Convert camelCase string to dash.
* @param {string} str - String to convert.
* @returns {string} Converted string.
*/
export function decamelize (str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

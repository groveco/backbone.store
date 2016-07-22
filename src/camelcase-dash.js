/**
 * @module
 * Camel case to dah converter.
 */

/**
 * Converter that converts camelCaseStrings to dash-strings and vice-versa.
 */
class CamelCaseDashConverter {

  /**
   * Convert dash string to camelCase.
   * @param {string} str - String to convert.
   * @returns {string} Converted string.
   */
  camelize(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
  }

  /**
   * Convert camelCase string to dash.
   * @param {string} str - String to convert.
   * @returns {string} Converted string.
   */
  decamelize(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

export default CamelCaseDashConverter;

/**
 * Clamps a number between a minimum and maximum value.
 * @param value The number to clamp
 * @param min The minimum value
 * @param max  The maximum value
 * @returns A number between min and max
 */
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(value, max));

/**
 * Compares two arrays for equality.
 * @returns {boolean} True if the arrays are equal, false otherwise.
 */
export const equals = (arr1, arr2) => {
	if (arr1.length !== arr2.length) {
		return false;
	}
	return arr1.every((value, index) => value === arr2[index]);
};
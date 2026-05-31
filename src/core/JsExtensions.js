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

/**
 * Generates a random integer between [0, max).
 * @returns {number}
 */
export const randomInt = (max) => Math.floor(Math.random() * max);

/**
 * Computes the modulus, ensuring a non-negative result.
 * @returns {number} The modulus result.
 */
export const mod = (n, m) => ((n % m) + m) % m;

/**
 * Removes all occurrences of a given element from the array (in place).
 * @param {Array<any>} arr - The array to modify.
 * @param {any} element - The element to remove.
 * @returns {Array<any>} The array after removal.
 */
export const remove = (arr, element) => {
	let index;
	// Repeatedly find the index of the element and splice it out
	while ((index = arr.indexOf(element)) !== -1) {
		arr.splice(index, 1);
	}
	return arr;
};
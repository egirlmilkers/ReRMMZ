/**
 * Clamps a number between a minimum and maximum value.
 * @param value The number to clamp
 * @param min The minimum value
 * @param max  The maximum value
 * @returns A number between min and max
 */
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(value, max));
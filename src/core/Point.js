import * as PIXI from 'pixi.js';

/**
 * The point class.
 *
 * @class
 * @extends PIXI.Point
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
export function Point(x, y) {
	PIXI.Point.call(this, x, y);
};

Point.prototype = Object.create(PIXI.Point.prototype);
Point.prototype.constructor = Point;

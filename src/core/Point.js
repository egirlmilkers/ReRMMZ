/**
 * The point class.
 *
 * @class
 * @extends PIXI.Point
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
export class Point extends PIXI.Point {
	constructor(x, y) {
		super(x, y);
	}


	// Interface methods from PIXI.Point so linter stops complaining
	x
	y
	clone = () => super.clone();
	copyFrom = (p) => super.copyFrom(p);
	copyTo = (p) => super.copyTo(p);
	equals = (p) => super.equals(p);
	set = (x, y) => super.set(x, y);
}

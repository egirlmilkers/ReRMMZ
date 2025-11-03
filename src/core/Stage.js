import * as PIXI from 'pixi.js';

/**
 * The root object of the display tree.
 *
 * @class
 * @extends PIXI.Container
 */
export function Stage() {
	PIXI.Container.call(this);
};

Stage.prototype = Object.create(PIXI.Container.prototype);
Stage.prototype.constructor = Stage;

/**
 * Destroys the stage.
 */
Stage.prototype.destroy = function () {
	const options = { children: true, texture: true };
	PIXI.Container.prototype.destroy.call(this, options);
};

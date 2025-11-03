import * as PIXI from 'pixi.js';

/**
 * The root object of the display tree.
 *
 * @class
 * @extends PIXI.Container
 */
export class Stage extends PIXI.Container {
	constructor() {
		super();
	}

	/**
	 * Destroys the stage.
	 */
	destroy() {
		const options = { children: true, texture: true };
		super.destroy(options);
	}
}

import * as PIXI from "pixi.js";

/**
 * The sprite which covers the entire game screen.
 *
 * @class
 * @extends PIXI.Container
 */
export class ScreenSprite extends PIXI.Container {
	constructor() {
		super();
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);
		this.opacity = 0;
		this._red = -1;
		this._green = -1;
		this._blue = -1;
		this.setBlack();
	}

	/**
	 * The opacity of the sprite (0 to 255).
	 *
	 * @type number
	 * @name ScreenSprite#opacity
	 */
	get opacity() {
		return this.alpha * 255;
	}

	set opacity(value) {
		this.alpha = value.clamp(0, 255) / 255;
	}

	/**
	 * Destroys the screen sprite.
	 */
	destroy() {
		const options = { children: true, texture: true };
		super.destroy(options);
	}

	/**
	 * Sets black to the color of the screen sprite.
	 */
	setBlack() {
		this.setColor(0, 0, 0);
	}

	/**
	 * Sets white to the color of the screen sprite.
	 */
	setWhite() {
		this.setColor(255, 255, 255);
	}

	/**
	 * Sets the color of the screen sprite by values.
	 *
	 * @param {number} r - The red value in the range (0, 255).
	 * @param {number} g - The green value in the range (0, 255).
	 * @param {number} b - The blue value in the range (0, 255).
	 */
	setColor(r, g, b) {
		if (this._red !== r || this._green !== g || this._blue !== b) {
			r = Math.round(r || 0).clamp(0, 255);
			g = Math.round(g || 0).clamp(0, 255);
			b = Math.round(b || 0).clamp(0, 255);
			this._red = r;
			this._green = g;
			this._blue = b;
			const graphics = this._graphics;
			graphics.clear();
			graphics.beginFill((r << 16) | (g << 8) | b, 1);
			graphics.drawRect(-50000, -50000, 100000, 100000);
		}
	}
}

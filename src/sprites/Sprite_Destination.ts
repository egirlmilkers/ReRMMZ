// Sprite_Destination
//
// The sprite for displaying the destination place of the touch input.

import { Bitmap, Sprite } from "../core/index.js";
import { DataManager } from "../managers/index.js";

export class Sprite_Destination extends Sprite {
	constructor() {
		super();
		this.createBitmap();
		this._frameCount = 0;
	}

	destroy(options) {
		if (this.bitmap) {
			this.bitmap.destroy();
		}
		super.destroy(options);
	}

	update() {
		super.update();
		if (DataManager.$gameTemp.isDestinationValid()) {
			this.updatePosition();
			this.updateAnimation();
			this.visible = true;
		} else {
			this._frameCount = 0;
			this.visible = false;
		}
	}

	createBitmap() {
		const tileWidth = DataManager.$gameMap.tileWidth();
		const tileHeight = DataManager.$gameMap.tileHeight();
		this.bitmap = new Bitmap(tileWidth, tileHeight);
		this.bitmap.fillAll("white");
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.blendMode = 1;
	}

	updatePosition() {
		const tileWidth = DataManager.$gameMap.tileWidth();
		const tileHeight = DataManager.$gameMap.tileHeight();
		const x = DataManager.$gameTemp.destinationX();
		const y = DataManager.$gameTemp.destinationY();
		this.x = (DataManager.$gameMap.adjustX(x) + 0.5) * tileWidth;
		this.y = (DataManager.$gameMap.adjustY(y) + 0.5) * tileHeight;
	}

	updateAnimation() {
		this._frameCount++;
		this._frameCount %= 20;
		this.opacity = (20 - this._frameCount) * 6;
		this.scale.x = 1 + this._frameCount / 20;
		this.scale.y = this.scale.x;
	}
}

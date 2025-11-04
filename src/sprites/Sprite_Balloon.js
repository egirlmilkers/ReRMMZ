// Sprite_Balloon
//
// The sprite for displaying a balloon icon.

import { Sprite } from "src/core/Sprite";

import { ImageManager } from "src/managers/ImageManager";

export class Sprite_Balloon extends Sprite {
	constructor() {
		super();
		this.initMembers();
		this.loadBitmap();
	}

	initMembers() {
		this._target = null;
		this._balloonId = 0;
		this._duration = 0;
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this.z = 7;
	}

	loadBitmap() {
		this.bitmap = ImageManager.loadSystem("Balloon");
		this.setFrame(0, 0, 0, 0);
	}

	setup(targetSprite, balloonId) {
		this._target = targetSprite;
		this._balloonId = balloonId;
		this._duration = 8 * this.speed() + this.waitTime();
	}

	update() {
		super.update();
		if (this._duration > 0) {
			this._duration--;
			if (this._duration > 0) {
				this.updatePosition();
				this.updateFrame();
			}
		}
	}

	updatePosition() {
		this.x = this._target.x;
		this.y = this._target.y - this._target.height;
	}

	updateFrame() {
		const w = 48;
		const h = 48;
		const sx = this.frameIndex() * w;
		const sy = (this._balloonId - 1) * h;
		this.setFrame(sx, sy, w, h);
	}

	speed() {
		return 8;
	}

	waitTime() {
		return 12;
	}

	frameIndex() {
		const index = (this._duration - this.waitTime()) / this.speed();
		return 7 - Math.max(Math.floor(index), 0);
	}

	isPlaying() {
		return this._duration > 0;
	}
}

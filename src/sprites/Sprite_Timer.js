// Sprite_Timer
//
// The sprite for displaying the timer.

import { Bitmap } from "../core/Bitmap";
import { Graphics } from "../core/Graphics";
import { Sprite } from "../core/Sprite";

import { ColorManager } from "../managers/ColorManager";
import { DataManager } from "../managers/DataManager";

export class Sprite_Timer extends Sprite {
	constructor() {
		super();
		this._seconds = 0;
		this.createBitmap();
		this.update();
	}

	destroy(options) {
		this.bitmap.destroy();
		super.destroy(options);
	}

	createBitmap() {
		this.bitmap = new Bitmap(96, 48);
		this.bitmap.fontFace = this.fontFace();
		this.bitmap.fontSize = this.fontSize();
		this.bitmap.outlineColor = ColorManager.outlineColor();
	}

	fontFace() {
		return DataManager.$gameSystem.numberFontFace();
	}

	fontSize() {
		return DataManager.$gameSystem.mainFontSize() + 8;
	}

	update() {
		super.update();
		this.updateBitmap();
		this.updatePosition();
		this.updateVisibility();
	}

	updateBitmap() {
		if (this._seconds !== DataManager.$gameTimer.seconds()) {
			this._seconds = DataManager.$gameTimer.seconds();
			this.redraw();
		}
	}

	redraw() {
		const text = this.timerText();
		const width = this.bitmap.width;
		const height = this.bitmap.height;
		this.bitmap.clear();
		this.bitmap.drawText(text, 0, 0, width, height, "center");
	}

	timerText() {
		const min = Math.floor(this._seconds / 60) % 60;
		const sec = this._seconds % 60;
		return min.padStart(2, "0") + ":" + sec.padStart(2, "0");
	}

	updatePosition() {
		this.x = (Graphics.width - this.bitmap.width) / 2;
		this.y = 0;
	}

	updateVisibility() {
		this.visible = DataManager.$gameTimer.isWorking();
	}
}

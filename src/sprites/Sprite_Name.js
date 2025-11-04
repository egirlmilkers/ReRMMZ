// Sprite_Name
//
// The sprite for displaying a status gauge.

import { Bitmap } from "../core/Bitmap";
import { Sprite } from "../core/Sprite";

import { ColorManager } from "../managers/ColorManager";
import { DataManager } from "../managers/DataManager";

export class Sprite_Name extends Sprite {
	constructor() {
		super();
		this.initMembers();
		this.createBitmap();
	}

	initMembers() {
		this._battler = null;
		this._name = "";
		this._textColor = "";
	}

	destroy(options) {
		this.bitmap.destroy();
		super.destroy(options);
	}

	createBitmap() {
		const width = this.bitmapWidth();
		const height = this.bitmapHeight();
		this.bitmap = new Bitmap(width, height);
	}

	bitmapWidth() {
		return 128;
	}

	bitmapHeight() {
		return 24;
	}

	fontFace() {
		return DataManager.$gameSystem.mainFontFace();
	}

	fontSize() {
		return DataManager.$gameSystem.mainFontSize();
	}

	setup(battler) {
		this._battler = battler;
		this.updateBitmap();
	}

	update() {
		super.update();
		this.updateBitmap();
	}

	updateBitmap() {
		const name = this.name();
		const color = this.textColor();
		if (name !== this._name || color !== this._textColor) {
			this._name = name;
			this._textColor = color;
			this.redraw();
		}
	}

	name() {
		return this._battler ? this._battler.name() : "";
	}

	textColor() {
		return ColorManager.hpColor(this._battler);
	}

	outlineColor() {
		return ColorManager.outlineColor();
	}

	outlineWidth() {
		return 3;
	}

	redraw() {
		const name = this.name();
		const width = this.bitmapWidth();
		const height = this.bitmapHeight();
		this.setupFont();
		this.bitmap.clear();
		this.bitmap.drawText(name, 0, 0, width, height, "left");
	}

	setupFont() {
		this.bitmap.fontFace = this.fontFace();
		this.bitmap.fontSize = this.fontSize();
		this.bitmap.textColor = this.textColor();
		this.bitmap.outlineColor = this.outlineColor();
		this.bitmap.outlineWidth = this.outlineWidth();
	}
}

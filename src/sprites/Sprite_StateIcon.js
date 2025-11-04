// Sprite_StateIcon
//
// The sprite for displaying state icons.

import { Sprite } from "../core/Sprite";

import { ImageManager } from "../managers/ImageManager";

export class Sprite_StateIcon extends Sprite {
	constructor() {
		super();
		this.initMembers();
		this.loadBitmap();
	}

	initMembers() {
		this._battler = null;
		this._iconIndex = 0;
		this._animationCount = 0;
		this._animationIndex = 0;
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
	}

	loadBitmap() {
		this.bitmap = ImageManager.loadSystem("IconSet");
		this.setFrame(0, 0, 0, 0);
	}

	setup(battler) {
		if (this._battler !== battler) {
			this._battler = battler;
			this._animationCount = this.animationWait();
		}
	}

	update() {
		super.update();
		this._animationCount++;
		if (this._animationCount >= this.animationWait()) {
			this.updateIcon();
			this.updateFrame();
			this._animationCount = 0;
		}
	}

	animationWait() {
		return 40;
	}

	updateIcon() {
		const icons = [];
		if (this.shouldDisplay()) {
			icons.push(...this._battler.allIcons());
		}
		if (icons.length > 0) {
			this._animationIndex++;
			if (this._animationIndex >= icons.length) {
				this._animationIndex = 0;
			}
			this._iconIndex = icons[this._animationIndex];
		} else {
			this._animationIndex = 0;
			this._iconIndex = 0;
		}
	}

	shouldDisplay() {
		const battler = this._battler;
		return battler && (battler.isActor() || battler.isAlive());
	}

	updateFrame() {
		const pw = ImageManager.iconWidth;
		const ph = ImageManager.iconHeight;
		const sx = (this._iconIndex % 16) * pw;
		const sy = Math.floor(this._iconIndex / 16) * ph;
		this.setFrame(sx, sy, pw, ph);
	}
}

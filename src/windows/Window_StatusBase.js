// Window_StatusBase
//
// The superclass of windows for displaying actor status.

import { BattleManager } from "../managers/BattleManager.js";
import { ColorManager } from "../managers/ColorManager.js";
import { DataManager } from "../managers/DataManager.js";
import { ImageManager } from "../managers/ImageManager.js";
import { TextManager } from "../managers/TextManager.js";

import { Sprite_Gauge } from "../sprites/Sprite_Gauge.js";
import { Sprite_Name } from "../sprites/Sprite_Name.js";
import { Sprite_StateIcon } from "../sprites/Sprite_StateIcon.js";

import { Window_Selectable } from "./Window_Selectable.js";

export class Window_StatusBase extends Window_Selectable {
	constructor(rect) {
		super(rect);
		this._additionalSprites = {};

		this.loadFaceImages();
	}

	loadFaceImages() {
		for (const actor of DataManager.$gameParty.members()) {
			ImageManager.loadFace(actor.faceName());
		}
	}

	refresh() {
		this.hideAdditionalSprites();
		super.refresh();
	}

	hideAdditionalSprites() {
		for (const sprite of Object.values(this._additionalSprites)) {
			sprite.hide();
		}
	}

	placeActorName(actor, x, y) {
		const key = `actor${actor.actorId()}-name`;
		const sprite = this.createInnerSprite(key, Sprite_Name);
		sprite.setup(actor);
		sprite.move(x, y);
		sprite.show();
	}

	placeStateIcon(actor, x, y) {
		const key = `actor${actor.actorId()}-stateIcon`;
		const sprite = this.createInnerSprite(key, Sprite_StateIcon);
		sprite.setup(actor);
		sprite.move(x, y);
		sprite.show();
	}

	placeGauge(actor, type, x, y) {
		const key = `actor${actor.actorId()}-gauge-${type}`;
		const sprite = this.createInnerSprite(key, Sprite_Gauge);
		sprite.setup(actor, type);
		sprite.move(x, y);
		sprite.show();
	}

	createInnerSprite(key, spriteClass) {
		const dict = this._additionalSprites;
		if (dict[key]) {
			return dict[key];
		} else {
			const sprite = new spriteClass();
			dict[key] = sprite;
			this.addInnerChild(sprite);
			return sprite;
		}
	}

	placeTimeGauge(actor, x, y) {
		if (BattleManager.isTpb()) {
			this.placeGauge(actor, "time", x, y);
		}
	}

	placeBasicGauges(actor, x, y) {
		this.placeGauge(actor, "hp", x, y);
		this.placeGauge(actor, "mp", x, y + this.gaugeLineHeight());
		if (DataManager.$dataSystem.optDisplayTp) {
			this.placeGauge(actor, "tp", x, y + this.gaugeLineHeight() * 2);
		}
	}

	gaugeLineHeight() {
		return 24;
	}

	drawActorCharacter(actor, x, y) {
		this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
	}

	// prettier-ignore
	drawActorFace(actor, x, y, width, height) {
        this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
    }

	drawActorName(actor, x, y, width) {
		width = width || 168;
		this.changeTextColor(ColorManager.hpColor(actor));
		this.drawText(actor.name(), x, y, width);
	}

	drawActorClass(actor, x, y, width) {
		width = width || 168;
		this.resetTextColor();
		this.drawText(actor.currentClass().name, x, y, width);
	}

	drawActorNickname(actor, x, y, width) {
		width = width || 270;
		this.resetTextColor();
		this.drawText(actor.nickname(), x, y, width);
	}

	drawActorLevel(actor, x, y) {
		this.changeTextColor(ColorManager.systemColor());
		this.drawText(TextManager.levelA, x, y, 48);
		this.resetTextColor();
		this.drawText(actor.level, x + 84, y, 36, "right");
	}

	drawActorIcons(actor, x, y, width) {
		width = width || 144;
		const delta = ImageManager.standardIconWidth - ImageManager.iconWidth;
		const iconWidth = ImageManager.standardIconWidth;
		const icons = actor.allIcons().slice(0, Math.floor(width / iconWidth));
		let iconX = x + delta / 2;
		for (const icon of icons) {
			this.drawIcon(icon, iconX, y + 2);
			iconX += iconWidth;
		}
	}

	drawActorSimpleStatus(actor, x, y) {
		const lineHeight = this.lineHeight();
		const x2 = x + 180;
		this.drawActorName(actor, x, y);
		this.drawActorLevel(actor, x, y + lineHeight * 1);
		this.drawActorIcons(actor, x, y + lineHeight * 2);
		this.drawActorClass(actor, x2, y);
		this.placeBasicGauges(actor, x2, y + lineHeight);
	}

	actorSlotName(actor, index) {
		const slots = actor.equipSlots();
		return DataManager.$dataSystem.equipTypes[slots[index]];
	}
}

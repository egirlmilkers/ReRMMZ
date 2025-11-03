// Sprite_Character
//
// The sprite for displaying a character.

import { Sprite } from "../core/index.js";
import { DataManager, ImageManager } from "../managers/index.js";

export class Sprite_Character extends Sprite {
	constructor(character) {
		super();
		this.initMembers();
		this.setCharacter(character);
	}

	initMembers() {
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._character = null;
		this._balloonDuration = 0;
		this._tilesetId = 0;
		this._upperBody = null;
		this._lowerBody = null;
	}

	setCharacter(character) {
		this._character = character;
	}

	checkCharacter(character) {
		return this._character === character;
	}

	update() {
		super.update();
		this.updateBitmap();
		this.updateFrame();
		this.updatePosition();
		this.updateOther();
		this.updateVisibility();
	}

	updateVisibility() {
		super.updateVisibility();
		if (this.isEmptyCharacter() || this._character.isTransparent()) {
			this.visible = false;
		}
	}

	isTile() {
		return this._character.isTile();
	}

	isObjectCharacter() {
		return this._character.isObjectCharacter();
	}

	isEmptyCharacter() {
		return this._tileId === 0 && !this._characterName;
	}

	tilesetBitmap(tileId) {
		const tileset = DataManager.$gameMap.tileset();
		const setNumber = 5 + Math.floor(tileId / 256);
		return ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
	}

	updateBitmap() {
		if (this.isImageChanged()) {
			this._tilesetId = DataManager.$gameMap.tilesetId();
			this._tileId = this._character.tileId();
			this._characterName = this._character.characterName();
			this._characterIndex = this._character.characterIndex();
			if (this._tileId > 0) {
				this.setTileBitmap();
			} else {
				this.setCharacterBitmap();
			}
		}
	}

	isImageChanged() {
		return (
			this._tilesetId !== DataManager.$gameMap.tilesetId() ||
			this._tileId !== this._character.tileId() ||
			this._characterName !== this._character.characterName() ||
			this._characterIndex !== this._character.characterIndex()
		);
	}

	setTileBitmap() {
		this.bitmap = this.tilesetBitmap(this._tileId);
	}

	setCharacterBitmap() {
		this.bitmap = ImageManager.loadCharacter(this._characterName);
		this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
	}

	updateFrame() {
		if (this._tileId > 0) {
			this.updateTileFrame();
		} else {
			this.updateCharacterFrame();
		}
	}

	updateTileFrame() {
		const tileId = this._tileId;
		const pw = this.patternWidth();
		const ph = this.patternHeight();
		const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * pw;
		const sy = (Math.floor((tileId % 256) / 8) % 16) * ph;
		this.setFrame(sx, sy, pw, ph);
	}

	updateCharacterFrame() {
		const pw = this.patternWidth();
		const ph = this.patternHeight();
		const sx = (this.characterBlockX() + this.characterPatternX()) * pw;
		const sy = (this.characterBlockY() + this.characterPatternY()) * ph;
		this.updateHalfBodySprites();
		if (this._bushDepth > 0) {
			const d = this._bushDepth;
			this._upperBody.setFrame(sx, sy, pw, ph - d);
			this._lowerBody.setFrame(sx, sy + ph - d, pw, d);
			this.setFrame(sx, sy, 0, ph);
		} else {
			this.setFrame(sx, sy, pw, ph);
		}
	}

	characterBlockX() {
		if (this._isBigCharacter) {
			return 0;
		} else {
			const index = this._character.characterIndex();
			return (index % 4) * 3;
		}
	}

	characterBlockY() {
		if (this._isBigCharacter) {
			return 0;
		} else {
			const index = this._character.characterIndex();
			return Math.floor(index / 4) * 4;
		}
	}

	characterPatternX() {
		return this._character.pattern();
	}

	characterPatternY() {
		return (this._character.direction() - 2) / 2;
	}

	patternWidth() {
		if (this._tileId > 0) {
			return DataManager.$gameMap.tileWidth();
		} else if (this._isBigCharacter) {
			return this.bitmap.width / 3;
		} else {
			return this.bitmap.width / 12;
		}
	}

	patternHeight() {
		if (this._tileId > 0) {
			return DataManager.$gameMap.tileHeight();
		} else if (this._isBigCharacter) {
			return this.bitmap.height / 4;
		} else {
			return this.bitmap.height / 8;
		}
	}

	updateHalfBodySprites() {
		if (this._bushDepth > 0) {
			this.createHalfBodySprites();
			this._upperBody.bitmap = this.bitmap;
			this._upperBody.visible = true;
			this._upperBody.y = -this._bushDepth;
			this._lowerBody.bitmap = this.bitmap;
			this._lowerBody.visible = true;
			this._upperBody.setBlendColor(this.getBlendColor());
			this._lowerBody.setBlendColor(this.getBlendColor());
			this._upperBody.setColorTone(this.getColorTone());
			this._lowerBody.setColorTone(this.getColorTone());
			this._upperBody.blendMode = this.blendMode;
			this._lowerBody.blendMode = this.blendMode;
		} else if (this._upperBody) {
			this._upperBody.visible = false;
			this._lowerBody.visible = false;
		}
	}

	createHalfBodySprites() {
		if (!this._upperBody) {
			this._upperBody = new Sprite();
			this._upperBody.anchor.x = 0.5;
			this._upperBody.anchor.y = 1;
			this.addChild(this._upperBody);
		}
		if (!this._lowerBody) {
			this._lowerBody = new Sprite();
			this._lowerBody.anchor.x = 0.5;
			this._lowerBody.anchor.y = 1;
			this._lowerBody.opacity = 128;
			this.addChild(this._lowerBody);
		}
	}

	updatePosition() {
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		this.z = this._character.screenZ();
	}

	updateOther() {
		this.opacity = this._character.opacity();
		this.blendMode = this._character.blendMode();
		this._bushDepth = this._character.bushDepth();
	}
}

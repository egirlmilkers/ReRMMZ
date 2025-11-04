// Spriteset_Battle
//
// The set of sprites on the battle screen.

import { Graphics } from "src/core/Graphics";
import { Sprite } from "src/core/Sprite";

import { DataManager } from "src/managers/DataManager";
import { ImageManager } from "src/managers/ImageManager";
import { SceneManager } from "src/managers/SceneManager";

import { Sprite_Actor } from "./Sprite_Actor";
import { Sprite_Battleback } from "./Sprite_Battleback";
import { Sprite_Enemy } from "./Sprite_Enemy";
import { Spriteset_Base } from "./Spriteset_Base";

export class Spriteset_Battle extends Spriteset_Base {
	constructor() {
		super();
		this._battlebackLocated = false;
	}

	loadSystemImages() {
		super.loadSystemImages();
		ImageManager.loadSystem("Shadow2");
		ImageManager.loadSystem("Weapons1");
		ImageManager.loadSystem("Weapons2");
		ImageManager.loadSystem("Weapons3");
	}

	createLowerLayer() {
		super.createLowerLayer();
		this.createBackground();
		this.createBattleback();
		this.createBattleField();
		this.createEnemies();
		this.createActors();
	}

	createBackground() {
		this._backgroundFilter = new PIXI.filters.BlurFilter();
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		this._backgroundSprite.filters = [this._backgroundFilter];
		this._baseSprite.addChild(this._backgroundSprite);
	}

	createBattleback() {
		this._back1Sprite = new Sprite_Battleback(0);
		this._back2Sprite = new Sprite_Battleback(1);
		this._baseSprite.addChild(this._back1Sprite);
		this._baseSprite.addChild(this._back2Sprite);
	}

	createBattleField() {
		const width = Graphics.boxWidth;
		const height = Graphics.boxHeight;
		const x = (Graphics.width - width) / 2;
		const y = (Graphics.height - height) / 2;
		this._battleField = new Sprite();
		this._battleField.setFrame(0, 0, width, height);
		this._battleField.x = x;
		this._battleField.y = y - this.battleFieldOffsetY();
		this._baseSprite.addChild(this._battleField);
		this._effectsContainer = this._battleField;
	}

	battleFieldOffsetY() {
		return 24;
	}

	update() {
		super.update();
		this.updateActors();
		this.updateBattleback();
		this.updateAnimations();
	}

	updateBattleback() {
		if (!this._battlebackLocated) {
			this._back1Sprite.adjustPosition();
			this._back2Sprite.adjustPosition();
			this._battlebackLocated = true;
		}
	}

	createEnemies() {
		const enemies = DataManager.$gameTroop.members();
		const sprites = [];
		for (const enemy of enemies) {
			sprites.push(new Sprite_Enemy(enemy));
		}
		sprites.sort(this.compareEnemySprite.bind(this));
		for (const sprite of sprites) {
			this._battleField.addChild(sprite);
		}
		this._enemySprites = sprites;
	}

	compareEnemySprite(a, b) {
		if (a.y !== b.y) {
			return a.y - b.y;
		} else {
			return b.spriteId - a.spriteId;
		}
	}

	createActors() {
		this._actorSprites = [];
		if (DataManager.$gameSystem.isSideView()) {
			for (
				let i = 0;
				i < DataManager.$gameParty.maxBattleMembers();
				i++
			) {
				const sprite = new Sprite_Actor();
				this._actorSprites.push(sprite);
				this._battleField.addChild(sprite);
			}
		}
	}

	updateActors() {
		const members = DataManager.$gameParty.battleMembers();
		for (let i = 0; i < this._actorSprites.length; i++) {
			this._actorSprites[i].setBattler(members[i]);
		}
	}

	findTargetSprite(target) {
		return this.battlerSprites().find((sprite) =>
			sprite.checkBattler(target),
		);
	}

	battlerSprites() {
		return this._enemySprites.concat(this._actorSprites);
	}

	isEffecting() {
		return this.battlerSprites().some((sprite) => sprite.isEffecting());
	}

	isAnyoneMoving() {
		return this.battlerSprites().some((sprite) => sprite.isMoving());
	}

	isBusy() {
		return this.isAnimationPlaying() || this.isAnyoneMoving();
	}
}

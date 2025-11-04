// Scene_Gameover
//
// The scene class of the game over screen.

import { Sprite } from "../core/Sprite.js";
import { Input } from "../core/Input.js";
import { TouchInput } from "../core/TouchInput.js";

import { AudioManager } from "../managers/AudioManager.js";
import { DataManager } from "../managers/DataManager.js";
import { ImageManager } from "../managers/ImageManager.js";
import { SceneManager } from "../managers/SceneManager.js";

import { Scene_Base } from "./Scene_Base.js";
import { Scene_Title } from "./Scene_Title.js";

export class Scene_Gameover extends Scene_Base {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.playGameoverMusic();
		this.createBackground();
	}

	start() {
		super.start();
		this.adjustBackground();
		this.startFadeIn(this.slowFadeSpeed(), false);
	}

	update() {
		if (this.isActive() && !this.isBusy() && this.isTriggered()) {
			this.gotoTitle();
		}
		super.update();
	}

	stop() {
		super.stop();
		this.fadeOutAll();
	}

	terminate() {
		super.terminate();
		AudioManager.stopAll();
	}

	playGameoverMusic() {
		AudioManager.stopBgm();
		AudioManager.stopBgs();
		AudioManager.playMe(DataManager.$dataSystem.gameoverMe);
	}

	createBackground() {
		this._backSprite = new Sprite();
		this._backSprite.bitmap = ImageManager.loadSystem("GameOver");
		this.addChild(this._backSprite);
	}

	adjustBackground() {
		this.scaleSprite(this._backSprite);
		this.centerSprite(this._backSprite);
	}

	isTriggered() {
		return Input.isTriggered("ok") || TouchInput.isTriggered();
	}

	gotoTitle() {
		SceneManager.goto(Scene_Title);
	}
}

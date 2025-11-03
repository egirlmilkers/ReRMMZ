// Scene_Gameover
//
// The scene class of the game over screen.

import { Input, Sprite, TouchInput } from "../core/index.js";
import {
	AudioManager,
	DataManager,
	ImageManager,
	SceneManager,
} from "../managers/index.js";
import { Scene_Base, Scene_Title } from "../scenes/index.js";

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

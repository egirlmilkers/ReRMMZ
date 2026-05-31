// Scene_Title
//
// The scene class of the title screen.

import { Sprite } from "../core/Sprite.js";
import { Graphics } from "../core/Graphics.js";
import { Rectangle } from "../core/Rectangle.js";
import { Bitmap } from "../core/Bitmap.js";

import { AudioManager } from "../managers/AudioManager.js";
import { DataManager } from "../managers/DataManager.js";
import { ImageManager } from "../managers/ImageManager.js";
import { SceneManager } from "../managers/SceneManager.js";

import { Window_TitleCommand } from "../windows/Window_TitleCommand.js";

import { Scene_Base } from "./Scene_Base.js";
import { Scene_Load } from "./Scene_Load.js";
import { Scene_Map } from "./Scene_Map.js";
import { Scene_Options } from "./Scene_Options.js";

export class Scene_Title extends Scene_Base {
	constructor() {
		super();
	}

	create() {
		super.create();
		this.createBackground();
		this.createForeground();
		this.createWindowLayer();
		this.createCommandWindow();
	}

	start() {
		super.start();
		SceneManager.clearStack();
		this.adjustBackground();
		this.playTitleMusic();
		this.startFadeIn(this.fadeSpeed(), false);
	}

	update() {
		if (!this.isBusy()) {
			this._commandWindow.open();
		}
		super.update();
	}

	isBusy() {
		return (
			this._commandWindow.isClosing() ||
			Scene_Base.prototype.isBusy.call(this)
		);
	}

	terminate() {
		super.terminate();
		SceneManager.snapForBackground();
		if (this._gameTitleSprite) {
			this._gameTitleSprite.bitmap.destroy();
		}
	}

	createBackground() {
		this._backSprite1 = new Sprite(
			ImageManager.loadTitle1(DataManager.$dataSystem.title1Name),
		);
		this._backSprite2 = new Sprite(
			ImageManager.loadTitle2(DataManager.$dataSystem.title2Name),
		);
		this.addChild(this._backSprite1);
		this.addChild(this._backSprite2);
	}

	createForeground() {
		this._gameTitleSprite = new Sprite(
			new Bitmap(Graphics.width, Graphics.height),
		);
		this.addChild(this._gameTitleSprite);
		if (DataManager.$dataSystem.optDrawTitle) {
			this.drawGameTitle();
		}
	}

	drawGameTitle() {
		const x = 20;
		const y = Graphics.height / 4;
		const maxWidth = Graphics.width - x * 2;
		const text = DataManager.$dataSystem.gameTitle;
		const bitmap = this._gameTitleSprite.bitmap;
		bitmap.fontFace = DataManager.$gameSystem.mainFontFace();
		bitmap.outlineColor = "black";
		bitmap.outlineWidth = 8;
		bitmap.fontSize = 72;
		bitmap.drawText(text, x, y, maxWidth, 48, "center");
	}

	adjustBackground() {
		this.scaleSprite(this._backSprite1);
		this.scaleSprite(this._backSprite2);
		this.centerSprite(this._backSprite1);
		this.centerSprite(this._backSprite2);
	}

	createCommandWindow() {
		const background =
			DataManager.$dataSystem.titleCommandWindow.background;
		const rect = this.commandWindowRect();
		this._commandWindow = new Window_TitleCommand(rect);
		this._commandWindow.setBackgroundType(background);
		this._commandWindow.setHandler(
			"newGame",
			this.commandNewGame.bind(this),
		);
		this._commandWindow.setHandler(
			"continue",
			this.commandContinue.bind(this),
		);
		this._commandWindow.setHandler(
			"options",
			this.commandOptions.bind(this),
		);
		this.addWindow(this._commandWindow);
	}

	commandWindowRect() {
		const offsetX = DataManager.$dataSystem.titleCommandWindow.offsetX;
		const offsetY = DataManager.$dataSystem.titleCommandWindow.offsetY;
		const ww = this.mainCommandWidth();
		const wh = this.calcWindowHeight(3, true);
		const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
		const wy = Graphics.boxHeight - wh - 96 + offsetY;
		return new Rectangle(wx, wy, ww, wh);
	}

	commandNewGame() {
		DataManager.setupNewGame();
		this._commandWindow.close();
		this.fadeOutAll();
		SceneManager.goto(Scene_Map);
	}

	commandContinue() {
		this._commandWindow.close();
		SceneManager.push(Scene_Load);
	}

	commandOptions() {
		this._commandWindow.close();
		SceneManager.push(Scene_Options);
	}

	playTitleMusic() {
		AudioManager.playBgm(DataManager.$dataSystem.titleBgm);
		AudioManager.stopBgs();
		AudioManager.stopMe();
	}
}

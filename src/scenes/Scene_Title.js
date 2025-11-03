// Scene_Title
//
// The scene class of the title screen.

import { Bitmap, Graphics, Rectangle, Sprite } from '../core/index.js';

import { AudioManager, DataManager, ImageManager, SceneManager } from '../managers/index.js';
import { Scene_Base, Scene_Load, Scene_Map, Scene_Options } from '../scenes/index.js';
import { Window_TitleCommand } from '../windows/index.js';

export function Scene_Title() {
	Scene_Base.call(this);
};

Scene_Title.prototype = Object.create(Scene_Base.prototype);
Scene_Title.prototype.constructor = Scene_Title;

Scene_Title.prototype.create = function () {
	Scene_Base.prototype.create.call(this);
	this.createBackground();
	this.createForeground();
	this.createWindowLayer();
	this.createCommandWindow();
};

Scene_Title.prototype.start = function () {
	Scene_Base.prototype.start.call(this);
	SceneManager.clearStack();
	this.adjustBackground();
	this.playTitleMusic();
	this.startFadeIn(this.fadeSpeed(), false);
};

Scene_Title.prototype.update = function () {
	if (!this.isBusy()) {
		this._commandWindow.open();
	}
	Scene_Base.prototype.update.call(this);
};

Scene_Title.prototype.isBusy = function () {
	return this._commandWindow.isClosing() || Scene_Base.prototype.isBusy.call(this);
};

Scene_Title.prototype.terminate = function () {
	Scene_Base.prototype.terminate.call(this);
	SceneManager.snapForBackground();
	if (this._gameTitleSprite) {
		this._gameTitleSprite.bitmap.destroy();
	}
};

Scene_Title.prototype.createBackground = function () {
	this._backSprite1 = new Sprite(ImageManager.loadTitle1(DataManager.$dataSystem.title1Name));
	this._backSprite2 = new Sprite(ImageManager.loadTitle2(DataManager.$dataSystem.title2Name));
	this.addChild(this._backSprite1);
	this.addChild(this._backSprite2);
};

Scene_Title.prototype.createForeground = function () {
	this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
	this.addChild(this._gameTitleSprite);
	if (DataManager.$dataSystem.optDrawTitle) {
		this.drawGameTitle();
	}
};

Scene_Title.prototype.drawGameTitle = function () {
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
};

Scene_Title.prototype.adjustBackground = function () {
	this.scaleSprite(this._backSprite1);
	this.scaleSprite(this._backSprite2);
	this.centerSprite(this._backSprite1);
	this.centerSprite(this._backSprite2);
};

Scene_Title.prototype.createCommandWindow = function () {
	const background = DataManager.$dataSystem.titleCommandWindow.background;
	const rect = this.commandWindowRect();
	this._commandWindow = new Window_TitleCommand(rect);
	this._commandWindow.setBackgroundType(background);
	this._commandWindow.setHandler("newGame", this.commandNewGame.bind(this));
	this._commandWindow.setHandler("continue", this.commandContinue.bind(this));
	this._commandWindow.setHandler("options", this.commandOptions.bind(this));
	this.addWindow(this._commandWindow);
};

Scene_Title.prototype.commandWindowRect = function () {
	const offsetX = DataManager.$dataSystem.titleCommandWindow.offsetX;
	const offsetY = DataManager.$dataSystem.titleCommandWindow.offsetY;
	const ww = this.mainCommandWidth();
	const wh = this.calcWindowHeight(3, true);
	const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
	const wy = Graphics.boxHeight - wh - 96 + offsetY;
	return new Rectangle(wx, wy, ww, wh);
};

Scene_Title.prototype.commandNewGame = function () {
	DataManager.setupNewGame();
	this._commandWindow.close();
	this.fadeOutAll();
	SceneManager.goto(Scene_Map);
};

Scene_Title.prototype.commandContinue = function () {
	this._commandWindow.close();
	SceneManager.push(Scene_Load);
};

Scene_Title.prototype.commandOptions = function () {
	this._commandWindow.close();
	SceneManager.push(Scene_Options);
};

Scene_Title.prototype.playTitleMusic = function () {
	AudioManager.playBgm(DataManager.$dataSystem.titleBgm);
	AudioManager.stopBgs();
	AudioManager.stopMe();
};

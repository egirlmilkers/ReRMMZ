// Scene_Save
//
// The scene class of the save screen.

import { DataManager, SoundManager, TextManager } from '../managers/index.js';
import { Scene_File } from '../scenes/index.js';

export function Scene_Save() {
	Scene_File.call(this);
};

Scene_Save.prototype = Object.create(Scene_File.prototype);
Scene_Save.prototype.constructor = Scene_Save;

Scene_Save.prototype.mode = function () {
	return "save";
};

Scene_Save.prototype.helpWindowText = function () {
	return TextManager.saveMessage;
};

Scene_Save.prototype.firstSavefileId = function () {
	return DataManager.$gameSystem.savefileId();
};

Scene_Save.prototype.onSavefileOk = function () {
	Scene_File.prototype.onSavefileOk.call(this);
	const savefileId = this.savefileId();
	if (this.isSavefileEnabled(savefileId)) {
		this.executeSave(savefileId);
	} else {
		this.onSaveFailure();
	}
};

Scene_Save.prototype.executeSave = function (savefileId) {
	DataManager.$gameSystem.setSavefileId(savefileId);
	DataManager.$gameSystem.onBeforeSave();
	DataManager.saveGame(savefileId)
		.then(() => this.onSaveSuccess())
		.catch(() => this.onSaveFailure());
};

Scene_Save.prototype.onSaveSuccess = function () {
	SoundManager.playSave();
	this.popScene();
};

Scene_Save.prototype.onSaveFailure = function () {
	SoundManager.playBuzzer();
	this.activateListWindow();
};

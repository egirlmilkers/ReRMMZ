//-----------------------------------------------------------------------------
// Scene_Load
//
// The scene class of the load screen.

import { DataManager, SceneManager, SoundManager, TextManager } from 'managers';
import { Scene_File, Scene_Map } from 'scenes';

export function Scene_Load() {
	this.initialize(...arguments);
}

Scene_Load.prototype = Object.create(Scene_File.prototype);
Scene_Load.prototype.constructor = Scene_Load;

Scene_Load.prototype.initialize = function () {
	Scene_File.prototype.initialize.call(this);
	this._loadSuccess = false;
};

Scene_Load.prototype.terminate = function () {
	Scene_File.prototype.terminate.call(this);
	if (this._loadSuccess) {
		DataManager.$gameSystem.onAfterLoad();
	}
};

Scene_Load.prototype.mode = function () {
	return "load";
};

Scene_Load.prototype.helpWindowText = function () {
	return TextManager.loadMessage;
};

Scene_Load.prototype.firstSavefileId = function () {
	return DataManager.latestSavefileId();
};

Scene_Load.prototype.onSavefileOk = function () {
	Scene_File.prototype.onSavefileOk.call(this);
	const savefileId = this.savefileId();
	if (this.isSavefileEnabled(savefileId)) {
		this.executeLoad(savefileId);
	} else {
		this.onLoadFailure();
	}
};

Scene_Load.prototype.executeLoad = function (savefileId) {
	DataManager.loadGame(savefileId)
		.then(() => this.onLoadSuccess())
		.catch(() => this.onLoadFailure());
};

Scene_Load.prototype.onLoadSuccess = function () {
	SoundManager.playLoad();
	this.fadeOutAll();
	this.reloadMapIfUpdated();
	SceneManager.goto(Scene_Map);
	this._loadSuccess = true;
};

Scene_Load.prototype.onLoadFailure = function () {
	SoundManager.playBuzzer();
	this.activateListWindow();
};

Scene_Load.prototype.reloadMapIfUpdated = function () {
	if (DataManager.$gameSystem.versionId() !== DataManager.$dataSystem.versionId) {
		const mapId = DataManager.$gameMap.mapId();
		const x = DataManager.$gamePlayer.x;
		const y = DataManager.$gamePlayer.y;
		const d = DataManager.$gamePlayer.direction();
		DataManager.$gamePlayer.reserveTransfer(mapId, x, y, d, 0);
		DataManager.$gamePlayer.requestMapReload();
	}
};

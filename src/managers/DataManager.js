//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

import { Graphics, Utils } from 'core';
import { BattleManager, ImageManager, StorageManager } from 'managers';
import { Game_Actors, Game_Map, Game_Message, Game_Party, Game_Player, Game_Screen, Game_SelfSwitches, Game_Switches, Game_System, Game_Temp, Game_Timer, Game_Troop, Game_Variables } from 'objects';

export function DataManager() {
	throw new Error("This is a static class");
}

DataManager.$dataActors = null;
DataManager.$dataClasses = null;
DataManager.$dataSkills = null;
DataManager.$dataItems = null;
DataManager.$dataWeapons = null;
DataManager.$dataArmors = null;
DataManager.$dataEnemies = null;
DataManager.$dataTroops = null;
DataManager.$dataStates = null;
DataManager.$dataAnimations = null;
DataManager.$dataTilesets = null;
DataManager.$dataCommonEvents = null;
DataManager.$dataSystem = null;
DataManager.$dataMapInfos = null;
DataManager.$dataMap = null;
DataManager.$gameTemp = null;
DataManager.$gameSystem = null;
DataManager.$gameScreen = null;
DataManager.$gameTimer = null;
DataManager.$gameMessage = null;
DataManager.$gameSwitches = null;
DataManager.$gameVariables = null;
DataManager.$gameSelfSwitches = null;
DataManager.$gameActors = null;
DataManager.$gameParty = null;
DataManager.$gameTroop = null;
DataManager.$gameMap = null;
DataManager.$gamePlayer = null;
DataManager.$testEvent = null;

DataManager._globalInfo = null;
DataManager._errors = [];

DataManager._databaseFiles = [
	{ name: "$dataActors", src: "Actors.json" },
	{ name: "$dataClasses", src: "Classes.json" },
	{ name: "$dataSkills", src: "Skills.json" },
	{ name: "$dataItems", src: "Items.json" },
	{ name: "$dataWeapons", src: "Weapons.json" },
	{ name: "$dataArmors", src: "Armors.json" },
	{ name: "$dataEnemies", src: "Enemies.json" },
	{ name: "$dataTroops", src: "Troops.json" },
	{ name: "$dataStates", src: "States.json" },
	{ name: "$dataAnimations", src: "Animations.json" },
	{ name: "$dataTilesets", src: "Tilesets.json" },
	{ name: "$dataCommonEvents", src: "CommonEvents.json" },
	{ name: "$dataSystem", src: "System.json" },
	{ name: "$dataMapInfos", src: "MapInfos.json" },
];

DataManager.loadGlobalInfo = function () {
	StorageManager.loadObject("global")
		.then((globalInfo) => {
			this._globalInfo = globalInfo;
			this.removeInvalidGlobalInfo();
			return 0;
		})
		.catch(() => {
			this._globalInfo = [];
		});
};

DataManager.removeInvalidGlobalInfo = function () {
	const globalInfo = this._globalInfo;
	for (const info of globalInfo) {
		const savefileId = globalInfo.indexOf(info);
		if (!this.savefileExists(savefileId)) {
			delete globalInfo[savefileId];
		}
	}
};

DataManager.saveGlobalInfo = function () {
	StorageManager.saveObject("global", this._globalInfo);
};

DataManager.isGlobalInfoLoaded = function () {
	return !!this._globalInfo;
};

DataManager.loadDatabase = function () {
	const test = this.isBattleTest() || this.isEventTest();
	const prefix = test ? "Test_" : "";
	for (const databaseFile of this._databaseFiles) {
		this.loadDataFile(databaseFile.name, prefix + databaseFile.src);
	}
	if (this.isEventTest()) {
		this.loadDataFile("$testEvent", prefix + "Event.json");
	}
};

DataManager.loadDataFile = function (name, src) {
	const xhr = new XMLHttpRequest();
	const url = "data/" + src;
	DataManager[name] = null; // Instead of window[name], assign it to a property ON DataManager
	xhr.open("GET", url);
	xhr.overrideMimeType("application/json");
	xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
	xhr.onerror = () => this.onXhrError(name, src, url);
	xhr.send();
};

DataManager.onXhrLoad = function (xhr, name, src, url) {
	if (xhr.status < 400) {
		DataManager[name] = JSON.parse(xhr.responseText); // Assign the loaded data to DataManager, not window
		this.onLoad(DataManager[name]);
	} else {
		this.onXhrError(name, src, url);
	}
};

DataManager.onXhrError = function (name, src, url) {
	const error = { name: name, src: src, url: url };
	this._errors.push(error);
};

DataManager.isDatabaseLoaded = function () {
	this.checkError();
	for (const databaseFile of this._databaseFiles) {
		if (!DataManager[databaseFile.name]) {
			return false;
		}
	}
	return true;
};

DataManager.loadMapData = function (mapId) {
	if (mapId > 0) {
		const filename = "Map%1.json".format(mapId.padZero(3));
		this.loadDataFile("$dataMap", filename);
	} else {
		this.makeEmptyMap();
	}
};

DataManager.makeEmptyMap = function () {
	DataManager.$dataMap = {};
	DataManager.$dataMap.data = [];
	DataManager.$dataMap.events = [];
	DataManager.$dataMap.width = 100;
	DataManager.$dataMap.height = 100;
	DataManager.$dataMap.scrollType = 3;
};

DataManager.isMapLoaded = function () {
	this.checkError();
	return !!DataManager.$dataMap;
};

DataManager.onLoad = function (object) {
	if (this.isMapObject(object)) {
		this.extractMetadata(object);
		this.extractArrayMetadata(object.events);
	} else {
		this.extractArrayMetadata(object);
	}
};

DataManager.isMapObject = function (object) {
	return !!(object.data && object.events);
};

DataManager.extractArrayMetadata = function (array) {
	if (Array.isArray(array)) {
		for (const data of array) {
			if (data && "note" in data) {
				this.extractMetadata(data);
			}
		}
	}
};

DataManager.extractMetadata = function (data) {
	const regExp = /<([^<>:]+)(:?)([^>]*)>/g;
	data.meta = {};
	for (;;) {
		const match = regExp.exec(data.note);
		if (match) {
			if (match[2] === ":") {
				data.meta[match[1]] = match[3];
			} else {
				data.meta[match[1]] = true;
			}
		} else {
			break;
		}
	}
};

DataManager.checkError = function () {
	if (this._errors.length > 0) {
		const error = this._errors.shift();
		const retry = () => {
			this.loadDataFile(error.name, error.src);
		};
		throw ["LoadError", error.url, retry];
	}
};

DataManager.isBattleTest = function () {
	return Utils.isOptionValid("btest");
};

DataManager.isEventTest = function () {
	return Utils.isOptionValid("etest");
};

DataManager.isTitleSkip = function () {
	return Utils.isOptionValid("tskip");
};

DataManager.isSkill = function (item) {
	return item && DataManager.$dataSkills.includes(item);
};

DataManager.isItem = function (item) {
	return item && DataManager.$dataItems.includes(item);
};

DataManager.isWeapon = function (item) {
	return item && DataManager.$dataWeapons.includes(item);
};

DataManager.isArmor = function (item) {
	return item && DataManager.$dataArmors.includes(item);
};

DataManager.createGameObjects = function () {
	DataManager.$gameTemp = new Game_Temp();
	DataManager.$gameSystem = new Game_System();
	DataManager.$gameScreen = new Game_Screen();
	DataManager.$gameTimer = new Game_Timer();
	DataManager.$gameMessage = new Game_Message();
	DataManager.$gameSwitches = new Game_Switches();
	DataManager.$gameVariables = new Game_Variables();
	DataManager.$gameSelfSwitches = new Game_SelfSwitches();
	DataManager.$gameActors = new Game_Actors();
	DataManager.$gameParty = new Game_Party();
	DataManager.$gameTroop = new Game_Troop();
	DataManager.$gameMap = new Game_Map();
	DataManager.$gamePlayer = new Game_Player();
};

DataManager.setupNewGame = function () {
	this.createGameObjects();
	this.selectSavefileForNewGame();
	DataManager.$gameParty.setupStartingMembers();
	DataManager.$gamePlayer.setupForNewGame();
	Graphics.frameCount = 0;
};

DataManager.setupBattleTest = function () {
	this.createGameObjects();
	DataManager.$gameParty.setupBattleTest();
	BattleManager.setup(DataManager.$dataSystem.testTroopId, true, false);
	BattleManager.setBattleTest(true);
	BattleManager.playBattleBgm();
};

DataManager.setupEventTest = function () {
	this.createGameObjects();
	this.selectSavefileForNewGame();
	DataManager.$gameParty.setupStartingMembers();
	DataManager.$gamePlayer.reserveTransfer(-1, 8, 6);
	DataManager.$gamePlayer.setTransparent(false);
};

DataManager.isAnySavefileExists = function () {
	return this._globalInfo.some((x) => x);
};

DataManager.latestSavefileId = function () {
	const globalInfo = this._globalInfo;
	const validInfo = globalInfo.slice(1).filter((x) => x);
	const latest = Math.max(...validInfo.map((x) => x.timestamp));
	const index = globalInfo.findIndex((x) => x && x.timestamp === latest);
	return index > 0 ? index : 0;
};

DataManager.earliestSavefileId = function () {
	const globalInfo = this._globalInfo;
	const validInfo = globalInfo.slice(1).filter((x) => x);
	const earliest = Math.min(...validInfo.map((x) => x.timestamp));
	const index = globalInfo.findIndex((x) => x && x.timestamp === earliest);
	return index > 0 ? index : 0;
};

DataManager.emptySavefileId = function () {
	const globalInfo = this._globalInfo;
	const maxSavefiles = this.maxSavefiles();
	if (globalInfo.length < maxSavefiles) {
		return Math.max(1, globalInfo.length);
	} else {
		const index = globalInfo.slice(1).findIndex((x) => !x);
		return index >= 0 ? index + 1 : -1;
	}
};

DataManager.loadAllSavefileImages = function () {
	for (const info of this._globalInfo.filter((x) => x)) {
		this.loadSavefileImages(info);
	}
};

DataManager.loadSavefileImages = function (info) {
	if (info.characters && Symbol.iterator in info.characters) {
		for (const character of info.characters) {
			ImageManager.loadCharacter(character[0]);
		}
	}
	if (info.faces && Symbol.iterator in info.faces) {
		for (const face of info.faces) {
			ImageManager.loadFace(face[0]);
		}
	}
};

DataManager.maxSavefiles = function () {
	return 20;
};

DataManager.savefileInfo = function (savefileId) {
	const globalInfo = this._globalInfo;
	return globalInfo[savefileId] ? globalInfo[savefileId] : null;
};

DataManager.savefileExists = function (savefileId) {
	const saveName = this.makeSavename(savefileId);
	return StorageManager.exists(saveName);
};

DataManager.saveGame = function (savefileId) {
	const contents = this.makeSaveContents();
	const saveName = this.makeSavename(savefileId);
	return StorageManager.saveObject(saveName, contents).then(() => {
		this._globalInfo[savefileId] = this.makeSavefileInfo();
		this.saveGlobalInfo();
		return 0;
	});
};

DataManager.loadGame = function (savefileId) {
	const saveName = this.makeSavename(savefileId);
	return StorageManager.loadObject(saveName).then((contents) => {
		this.createGameObjects();
		this.extractSaveContents(contents);
		this.correctDataErrors();
		return 0;
	});
};

DataManager.makeSavename = function (savefileId) {
	return "file%1".format(savefileId);
};

DataManager.selectSavefileForNewGame = function () {
	const emptySavefileId = this.emptySavefileId();
	const earliestSavefileId = this.earliestSavefileId();
	if (emptySavefileId > 0) {
		DataManager.$gameSystem.setSavefileId(emptySavefileId);
	} else {
		DataManager.$gameSystem.setSavefileId(earliestSavefileId);
	}
};

DataManager.makeSavefileInfo = function () {
	const info = {};
	info.title = DataManager.$dataSystem.gameTitle;
	info.characters = DataManager.$gameParty.charactersForSavefile();
	info.faces = DataManager.$gameParty.facesForSavefile();
	info.playtime = DataManager.$gameSystem.playtimeText();
	info.timestamp = Date.now();
	return info;
};

DataManager.makeSaveContents = function () {
	// A save data does not contain DataManager.$gameTemp, DataManager.$gameMessage, and DataManager.$gameTroop.
	const contents = {};
	contents.system = DataManager.$gameSystem;
	contents.screen = DataManager.$gameScreen;
	contents.timer = DataManager.$gameTimer;
	contents.switches = DataManager.$gameSwitches;
	contents.variables = DataManager.$gameVariables;
	contents.selfSwitches = DataManager.$gameSelfSwitches;
	contents.actors = DataManager.$gameActors;
	contents.party = DataManager.$gameParty;
	contents.map = DataManager.$gameMap;
	contents.player = DataManager.$gamePlayer;
	return contents;
};

DataManager.extractSaveContents = function (contents) {
	DataManager.$gameSystem = contents.system;
	DataManager.$gameScreen = contents.screen;
	DataManager.$gameTimer = contents.timer;
	DataManager.$gameSwitches = contents.switches;
	DataManager.$gameVariables = contents.variables;
	DataManager.$gameSelfSwitches = contents.selfSwitches;
	DataManager.$gameActors = contents.actors;
	DataManager.$gameParty = contents.party;
	DataManager.$gameMap = contents.map;
	DataManager.$gamePlayer = contents.player;
};

DataManager.correctDataErrors = function () {
	DataManager.$gameParty.removeInvalidMembers();
};

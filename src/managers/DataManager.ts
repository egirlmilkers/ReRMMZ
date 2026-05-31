// DataManager
//
// The static class that manages the database and game objects.

import { Utils } from "../core/Utils.js";
import { Graphics } from "../core/Graphics.js";

import { Game_Actors } from "../objects/Game_Actors.js";
import { Game_Map } from "../objects/Game_Map.js";
import { Game_Message } from "../objects/Game_Message.js";
import { Game_Party } from "../objects/Game_Party.js";
import { Game_Player } from "../objects/Game_Player.js";
import { Game_Screen } from "../objects/Game_Screen.js";
import { Game_SelfSwitches } from "../objects/Game_SelfSwitches.js";
import { Game_Switches } from "../objects/Game_Switches.js";
import { Game_System } from "../objects/Game_System.js";
import { Game_Temp } from "../objects/Game_Temp.js";
import { Game_Timer } from "../objects/Game_Timer.js";
import { Game_Troop } from "../objects/Game_Troop.js";
import { Game_Variables } from "../objects/Game_Variables.js";

import { BattleManager } from "./BattleManager.js";
import { ImageManager } from "./ImageManager.js";
import { StorageManager } from "./StorageManager.js";

export class DataManager {
	static $dataActors: RMMZ.Actor[];
	static $dataClasses: RMMZ.Class[];
	static $dataSkills: RMMZ.Skill[];
	static $dataItems: RMMZ.Item[];
	static $dataWeapons: RMMZ.Weapon[];
	static $dataArmors: RMMZ.Armor[];
	static $dataEnemies: RMMZ.Enemy[];
	static $dataTroops: RMMZ.Troop[];
	static $dataStates: RMMZ.State[];
	static $dataAnimations: RMMZ.Animation[];
	static $dataTilesets: RMMZ.Tileset[];
	static $dataCommonEvents: RMMZ.CommonEvent[];
	static $dataSystem: RMMZ.System;
	static $dataMapInfos: RMMZ.MapInfo[];
	static $dataMap: RMMZ.Map;

	static $gameTemp: Game_Temp;
	static $gameSystem: Game_System;
	static $gameScreen: Game_Screen;
	static $gameTimer: Game_Timer;
	static $gameMessage: Game_Message;
	static $gameSwitches: Game_Switches;
	static $gameVariables: Game_Variables;
	static $gameSelfSwitches: Game_SelfSwitches;
	static $gameActors: Game_Actors;
	static $gameParty: Game_Party;
	static $gameTroop: Game_Troop;
	static $gameMap: Game_Map;
	static $gamePlayer: Game_Player;
	
	static $testEvent: RMMZ.EventCommand[];

	static _globalInfo: RMMZ.Global[];
	static _errors: RMMZ.Error[] = [];

	static _databaseFiles = [
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

	constructor() {
		throw new Error("This is a static class");
	}

	static loadGlobalInfo() {
		StorageManager.loadObject("global")
			.then((globalInfo) => {
				this._globalInfo = globalInfo as RMMZ.Global[];
				this.removeInvalidGlobalInfo();
			})
			.catch(() => {
				this._globalInfo = [];
			});
	}

	static removeInvalidGlobalInfo() {
		const globalInfo = this._globalInfo;
		for (const info of globalInfo) {
			const savefileId = globalInfo.indexOf(info);
			if (!this.savefileExists(savefileId)) {
				delete globalInfo[savefileId];
			}
		}
	}

	static saveGlobalInfo() {
		StorageManager.saveObject("global", this._globalInfo).catch(error => console.log("Failed to save global info:", error));
	}

	static isGlobalInfoLoaded(): boolean {
		return !!this._globalInfo;
	}

	static loadDatabase() {
		const test = this.isBattleTest() || this.isEventTest();
		const prefix = test ? "Test_" : "";
		for (const databaseFile of this._databaseFiles) {
			this.loadDataFile(databaseFile.name, prefix + databaseFile.src);
		}
		if (this.isEventTest()) {
			this.loadDataFile("$testEvent", prefix + "Event.json");
		}
	}

	static loadDataFile(name: string, src: string) {
		const xhr = new XMLHttpRequest();
		const url = "assets/data/" + src;
		(DataManager as any)[name] = null; // Instead of window[name], assign it to a property ON DataManager
		xhr.open("GET", url);
		xhr.overrideMimeType("application/json");
		xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
		xhr.onerror = () => this.onXhrError(name, src, url);
		xhr.send();
	}

	static onXhrLoad(xhr: XMLHttpRequest, name: string, src: string, url: string) {
		if (xhr.status < 400) {
			DataManager[name as keyof typeof DataManager] = JSON.parse(xhr.responseText); // Assign the loaded data to DataManager, not window
			this.onLoad((DataManager as any)[name]);
		} else {
			this.onXhrError(name, src, url);
		}
	}

	static onXhrError(name: string, src: string, url: string) {
		const error = { name: name, src: src, url: url };
		this._errors.push(error);
	}

	static isDatabaseLoaded(): boolean {
		this.checkError();
		for (const databaseFile of this._databaseFiles) {
			if (!DataManager[databaseFile.name as keyof typeof DataManager]) {
				return false;
			}
		}
		return true;
	}

	static loadMapData(mapId: number) {
		if (mapId > 0) {
			const filename = `Map${String(mapId).padStart(3, "0")}.json`
			this.loadDataFile("$dataMap", filename);
		} else {
			this.makeEmptyMap();
		}
	}

	static makeEmptyMap() {
		DataManager.$dataMap = {
			data: [],
			events: [],
			width: 100,
			height: 100,
			scrollType: 3
		};
	}

	static isMapLoaded(): boolean {
		this.checkError();
		return !!DataManager.$dataMap;
	}

	static onLoad(object: RMMZ.DataObj | RMMZ.DataObj[]) {
		if (this.isMapObject(object)){
			this.extractMetadata(object);
			this.extractArrayMetadata(object.events);
		} else {
			this.extractArrayMetadata(object);
		}
	}

	static isMapObject(object: RMMZ.DataObj | RMMZ.DataObj[]): object is RMMZ.Map {
		return 'data' in object && 'events' in object;
	}

	static extractArrayMetadata(array: object) {
		if (Array.isArray(array)) {
			for (const data of array) {
				if (data && "note" in data) {
					this.extractMetadata(data);
				}
			}
		}
	}

	static extractMetadata(data: RMMZ.DataObj) {
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
	}

	static checkError() {
		if (this._errors.length > 0) {
			const error = this._errors.shift() as RMMZ.Error;
			const retry = () => {
				this.loadDataFile(error.name, error.src);
			};
			throw ["LoadError", error.url, retry];
		}
	}

	static isBattleTest(): boolean {
		return Utils.isOptionValid("btest");
	}

	static isEventTest(): boolean {
		return Utils.isOptionValid("etest");
	}

	static isTitleSkip(): boolean {
		return Utils.isOptionValid("tskip");
	}

	static isSkill(item: RMMZ.DataObj): item is RMMZ.Skill {
		return DataManager.$dataSkills.includes(item as RMMZ.Skill);
	}

	static isItem(item: RMMZ.DataObj): item is RMMZ.Item {
		return DataManager.$dataItems.includes(item as RMMZ.Item);
	}

	static isWeapon(item: RMMZ.DataObj): item is RMMZ.Weapon {
		return DataManager.$dataWeapons.includes(item as RMMZ.Weapon);
	}

	static isArmor(item: RMMZ.DataObj): item is RMMZ.Armor {
		return DataManager.$dataArmors.includes(item as RMMZ.Armor);
	}

	static createGameObjects() {
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
	}

	static setupNewGame() {
		this.createGameObjects();
		this.selectSavefileForNewGame();
		DataManager.$gameParty.setupStartingMembers();
		DataManager.$gamePlayer.setupForNewGame();
		Graphics.frameCount = 0;
	}

	static setupBattleTest() {
		this.createGameObjects();
		DataManager.$gameParty.setupBattleTest();
		BattleManager.setup(DataManager.$dataSystem.testTroopId, true, false);
		BattleManager.setBattleTest(true);
		BattleManager.playBattleBgm();
	}

	static setupEventTest() {
		this.createGameObjects();
		this.selectSavefileForNewGame();
		DataManager.$gameParty.setupStartingMembers();
		DataManager.$gamePlayer.reserveTransfer(-1, 8, 6);
		DataManager.$gamePlayer.setTransparent(false);
	}

	static isAnySavefileExists(): boolean {
		return this._globalInfo.some((x) => x);
	}

	static latestSavefileId(): number {
		const globalInfo = this._globalInfo;
		const validInfo = globalInfo.slice(1).filter((x) => x);
		const latest = Math.max(...validInfo.map((x) => x.timestamp));
		const index = globalInfo.findIndex((x) => x && x.timestamp === latest);
		return index > 0 ? index : 0;
	}

	static earliestSavefileId(): number {
		const globalInfo = this._globalInfo;
		const validInfo = globalInfo.slice(1).filter((x) => x);
		const earliest = Math.min(...validInfo.map((x) => x.timestamp));
		const index = globalInfo.findIndex(
			(x) => x && x.timestamp === earliest,
		);
		return index > 0 ? index : 0;
	}

	static emptySavefileId(): number {
		const globalInfo = this._globalInfo;
		const maxSavefiles = this.maxSavefiles();
		if (globalInfo.length < maxSavefiles) {
			return Math.max(1, globalInfo.length);
		} else {
			const index = globalInfo.slice(1).findIndex((x) => !x);
			return index >= 0 ? index + 1 : -1;
		}
	}

	static loadAllSavefileImages() {
		for (const info of this._globalInfo.filter((x) => x)) {
			this.loadSavefileImages(info);
		}
	}

	static loadSavefileImages(info: RMMZ.Global) {
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
	}

	static maxSavefiles(): number {
		return 20;
	}

	static savefileInfo(savefileId: number): RMMZ.Global | null {
		const globalInfo = this._globalInfo;
		return globalInfo[savefileId] ? globalInfo[savefileId] : null;
	}

	static savefileExists(savefileId: number): boolean {
		const saveName = this.makeSavename(savefileId);
		return StorageManager.exists(saveName);
	}

	static saveGame(savefileId: number) {
		const contents = this.makeSaveContents();
		const saveName = this.makeSavename(savefileId);
		return StorageManager.saveObject(saveName, contents).then(() => {
			this._globalInfo[savefileId] = this.makeSavefileInfo();
			this.saveGlobalInfo();
		});
	}

	static loadGame(savefileId: number) {
		const saveName = this.makeSavename(savefileId);
		return StorageManager.loadObject(saveName).then((contents) => {
			this.createGameObjects();
			this.extractSaveContents(contents);
			this.correctDataErrors();
		});
	}

	static makeSavename(savefileId: number) {
		return `file${savefileId}`;
	}

	static selectSavefileForNewGame() {
		const emptySavefileId = this.emptySavefileId();
		const earliestSavefileId = this.earliestSavefileId();
		if (emptySavefileId > 0) {
			DataManager.$gameSystem.setSavefileId(emptySavefileId);
		} else {
			DataManager.$gameSystem.setSavefileId(earliestSavefileId);
		}
	}

	static makeSavefileInfo(): RMMZ.Global {
		const info = {
			title: DataManager.$dataSystem.gameTitle,
			characters: DataManager.$gameParty.charactersForSavefile(),
			faces: DataManager.$gameParty.facesForSavefile(),
			playtime: DataManager.$gameSystem.playtimeText(),
			timestamp: Date.now(),
		};
		return info;
	}

	static makeSaveContents(): RMMZ.Save {
		// A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
		const contents = {
			system: DataManager.$gameSystem,
			screen: DataManager.$gameScreen,
			timer: DataManager.$gameTimer,
			switches: DataManager.$gameSwitches,
			variables: DataManager.$gameVariables,
			selfSwitches: DataManager.$gameSelfSwitches,
			actors: DataManager.$gameActors,
			party: DataManager.$gameParty,
			map: DataManager.$gameMap,
			player: DataManager.$gamePlayer,
		};
		return contents;
	}

	static extractSaveContents(contents: RMMZ.Save) {
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
	}

	static correctDataErrors() {
		DataManager.$gameParty.removeInvalidMembers();
	}
}

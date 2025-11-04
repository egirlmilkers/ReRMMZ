// Scene_Boot
//
// The scene class for initializing the entire game.

import { Graphics } from "src/core/Graphics";
import { Utils } from "src/core/Utils";

import { ColorManager } from "src/managers/ColorManager";
import { ConfigManager } from "src/managers/ConfigManager";
import { DataManager } from "src/managers/DataManager";
import { FontManager } from "src/managers/FontManager";
import { ImageManager } from "src/managers/ImageManager";
import { SceneManager } from "src/managers/SceneManager";
import { SoundManager } from "src/managers/SoundManager";

import { Window_TitleCommand } from "src/windows/Window_TitleCommand";

import { Scene_Base } from "./Scene_Base";
import { Scene_Battle } from "./Scene_Battle";
import { Scene_Map } from "./Scene_Map";
import { Scene_Splash } from "./Scene_Splash";

export class Scene_Boot extends Scene_Base {
	constructor() {
		super();
		this._databaseLoaded = false;
	}

	create() {
		super.create();
		DataManager.loadDatabase();
		StorageManager.updateForageKeys();
	}

	isReady() {
		if (!this._databaseLoaded) {
			if (
				DataManager.isDatabaseLoaded() &&
				StorageManager.forageKeysUpdated()
			) {
				this._databaseLoaded = true;
				this.onDatabaseLoaded();
			}
			return false;
		}
		return (
			Scene_Base.prototype.isReady.call(this) && this.isPlayerDataLoaded()
		);
	}

	onDatabaseLoaded() {
		this.setEncryptionInfo();
		this.loadSystemImages();
		this.loadPlayerData();
		this.loadGameFonts();
	}

	setEncryptionInfo() {
		const hasImages = DataManager.$dataSystem.hasEncryptedImages;
		const hasAudio = DataManager.$dataSystem.hasEncryptedAudio;
		const key = DataManager.$dataSystem.encryptionKey;
		Utils.setEncryptionInfo(hasImages, hasAudio, key);
	}

	loadSystemImages() {
		ColorManager.loadWindowskin();
		ImageManager.loadSystem("IconSet");
	}

	loadPlayerData() {
		DataManager.loadGlobalInfo();
		ConfigManager.load();
	}

	loadGameFonts() {
		const advanced = DataManager.$dataSystem.advanced;
		FontManager.load("rmmz-mainfont", advanced.mainFontFilename);
		FontManager.load("rmmz-numberfont", advanced.numberFontFilename);
	}

	isPlayerDataLoaded() {
		return DataManager.isGlobalInfoLoaded() && ConfigManager.isLoaded();
	}

	start() {
		super.start();
		SoundManager.preloadImportantSounds();
		if (DataManager.isBattleTest()) {
			DataManager.setupBattleTest();
			SceneManager.goto(Scene_Battle);
		} else if (DataManager.isEventTest()) {
			DataManager.setupEventTest();
			SceneManager.goto(Scene_Map);
		} else if (DataManager.isTitleSkip()) {
			this.checkPlayerLocation();
			DataManager.setupNewGame();
			SceneManager.goto(Scene_Map);
		} else {
			this.startNormalGame();
		}
		this.resizeScreen();
		this.updateDocumentTitle();
	}

	startNormalGame() {
		this.checkPlayerLocation();
		DataManager.setupNewGame();
		Window_TitleCommand.initCommandPosition();
		SceneManager.goto(Scene_Splash);
	}

	resizeScreen() {
		const screenWidth = DataManager.$dataSystem.advanced.screenWidth;
		const screenHeight = DataManager.$dataSystem.advanced.screenHeight;
		Graphics.resize(screenWidth, screenHeight);
		Graphics.defaultScale = this.screenScale();
		this.adjustBoxSize();
		this.adjustWindow();
	}

	adjustBoxSize() {
		const uiAreaWidth = DataManager.$dataSystem.advanced.uiAreaWidth;
		const uiAreaHeight = DataManager.$dataSystem.advanced.uiAreaHeight;
		const boxMargin = 4;
		Graphics.boxWidth = uiAreaWidth - boxMargin * 2;
		Graphics.boxHeight = uiAreaHeight - boxMargin * 2;
	}

	adjustWindow() {
		if (Utils.isNwjs()) {
			const scale = this.screenScale();
			const xDelta = Graphics.width * scale - window.innerWidth;
			const yDelta = Graphics.height * scale - window.innerHeight;
			window.moveBy(-xDelta / 2, -yDelta / 2);
			window.resizeBy(xDelta, yDelta);
		}
	}

	screenScale() {
		if ("screenScale" in DataManager.$dataSystem.advanced) {
			return DataManager.$dataSystem.advanced.screenScale;
		} else {
			return 1;
		}
	}

	updateDocumentTitle() {
		document.title = DataManager.$dataSystem.gameTitle;
	}

	checkPlayerLocation() {
		if (DataManager.$dataSystem.startMapId === 0) {
			throw new Error("Player's starting position is not set");
		}
	}
}

// SceneManager
//
// The static class that manages scene transitions.

import {
	Bitmap,
	Graphics,
	Input,
	TouchInput,
	Utils,
	Video,
	WebAudio,
} from "../core/index.js";
import {
	AudioManager,
	EffectManager,
	ImageManager,
	PluginManager,
} from "../managers/index.js";

export class SceneManager {
	static _scene = null;
	static _nextScene = null;
	static _stack = [];
	static _exiting = false;
	static _previousScene = null;
	static _previousClass = null;
	static _backgroundBitmap = null;
	static _smoothDeltaTime = 1;
	static _elapsedTime = 0;

	constructor() {
		throw new Error("This is a static class");
	}

	static run(sceneClass) {
		try {
			SceneManager.initialize();
			SceneManager.goto(sceneClass);
			Graphics.startGameLoop();
		} catch (e) {
			SceneManager.catchException(e);
		}
	}

	static initialize() {
		SceneManager.checkBrowser();
		SceneManager.checkPluginErrors();
		SceneManager.initGraphics();
		SceneManager.initAudio();
		SceneManager.initVideo();
		SceneManager.initInput();
		SceneManager.setupEventHandlers();
	}

	static checkBrowser() {
		if (!Utils.canUseWebGL()) {
			throw new Error("Your browser does not support WebGL.");
		}
		if (!Utils.canUseWebAudioAPI()) {
			throw new Error("Your browser does not support Web Audio API.");
		}
		if (!Utils.canUseCssFontLoading()) {
			throw new Error("Your browser does not support CSS Font Loading.");
		}
		if (!Utils.canUseIndexedDB()) {
			throw new Error("Your browser does not support IndexedDB.");
		}
	}

	static checkPluginErrors() {
		PluginManager.checkErrors();
	}

	static initGraphics() {
		if (!Graphics.initialize()) {
			throw new Error("Failed to initialize graphics.");
		}
		Graphics.setTickHandler(SceneManager.update.bind(SceneManager));
	}

	static initAudio() {
		WebAudio.initialize();
	}

	static initVideo() {
		Video.initialize(Graphics.width, Graphics.height);
	}

	static initInput() {
		Input.initialize();
		TouchInput.initialize();
	}

	static setupEventHandlers() {
		window.addEventListener("error", SceneManager.onError.bind(SceneManager));
		window.addEventListener(
			"unhandledrejection",
			SceneManager.onReject.bind(SceneManager),
		);
		window.addEventListener("unload", SceneManager.onUnload.bind(SceneManager));
		document.addEventListener(
			"keydown",
			SceneManager.onKeyDown.bind(SceneManager),
		);
	}

	static update(deltaTime) {
		try {
			const n = SceneManager.determineRepeatNumber(deltaTime);
			for (let i = 0; i < n; i++) {
				SceneManager.updateMain();
			}
		} catch (e) {
			SceneManager.catchException(e);
		}
	}

	static determineRepeatNumber(deltaTime) {
		// [Note] We consider environments where the refresh rate is higher than
		//   60Hz, but ignore sudden irregular deltaTime.
		SceneManager._smoothDeltaTime *= 0.8;
		SceneManager._smoothDeltaTime += Math.min(deltaTime, 2) * 0.2;
		if (SceneManager._smoothDeltaTime >= 0.9) {
			SceneManager._elapsedTime = 0;
			return Math.round(SceneManager._smoothDeltaTime);
		} else {
			SceneManager._elapsedTime += deltaTime;
			if (SceneManager._elapsedTime >= 1) {
				SceneManager._elapsedTime -= 1;
				return 1;
			}
			return 0;
		}
	}

	static terminate() {
		if (Utils.isNwjs()) {
			nw.App.quit();
		}
	}

	static onError(event) {
		console.error(event.message);
		console.error(event.filename, event.lineno);
		try {
			SceneManager.stop();
			Graphics.printError("Error", event.message, event);
			AudioManager.stopAll();
		} catch (e) {
			//
		}
	}

	static onReject(event) {
		// Catch uncaught exception in Promise
		event.message = event.reason;
		SceneManager.onError(event);
	}

	static onUnload() {
		ImageManager.clear();
		EffectManager.clear();
		AudioManager.stopAll();
	}

	static onKeyDown(event) {
		if (!event.ctrlKey && !event.altKey) {
			switch (event.keyCode) {
				case 116: // F5
					SceneManager.reloadGame();
					break;
				case 119: // F8
					SceneManager.showDevTools();
					break;
			}
		}
	}

	static reloadGame() {
		if (Utils.isNwjs()) {
			chrome.runtime.reload();
		}
	}

	static showDevTools() {
		if (Utils.isNwjs() && Utils.isOptionValid("test")) {
			nw.Window.get().showDevTools();
		}
	}

	static catchException(e) {
		if (e instanceof Error) {
			SceneManager.catchNormalError(e);
		} else if (e instanceof Array && e[0] === "LoadError") {
			SceneManager.catchLoadError(e);
		} else {
			SceneManager.catchUnknownError(e);
		}
		SceneManager.stop();
	}

	static catchNormalError(e) {
		Graphics.printError(e.name, e.message, e);
		AudioManager.stopAll();
		console.error(e.stack);
	}

	static catchLoadError(e) {
		const url = e[1];
		const retry = e[2];
		Graphics.printError("Failed to load", url);
		if (retry) {
			Graphics.showRetryButton(() => {
				retry();
				SceneManager.resume();
			});
		} else {
			AudioManager.stopAll();
		}
	}

	static catchUnknownError(e) {
		Graphics.printError("UnknownError", String(e));
		AudioManager.stopAll();
	}

	static updateMain() {
		SceneManager.updateFrameCount();
		SceneManager.updateInputData();
		SceneManager.updateEffekseer();
		SceneManager.changeScene();
		SceneManager.updateScene();
	}

	static updateFrameCount() {
		Graphics.frameCount++;
	}

	static updateInputData() {
		Input.update();
		TouchInput.update();
	}

	static updateEffekseer() {
		if (Graphics.effekseer && SceneManager.isGameActive()) {
			Graphics.effekseer.update();
		}
	}

	static changeScene() {
		if (SceneManager.isSceneChanging() && !SceneManager.isCurrentSceneBusy()) {
			if (SceneManager._scene) {
				SceneManager._scene.terminate();
				SceneManager.onSceneTerminate();
			}
			SceneManager._scene = SceneManager._nextScene;
			SceneManager._nextScene = null;
			if (SceneManager._scene) {
				SceneManager._scene.create();
				SceneManager.onSceneCreate();
			}
			if (SceneManager._exiting) {
				SceneManager.terminate();
			}
		}
	}

	static updateScene() {
		if (SceneManager._scene) {
			if (SceneManager._scene.isStarted()) {
				if (SceneManager.isGameActive()) {
					SceneManager._scene.update();
				}
			} else if (SceneManager._scene.isReady()) {
				SceneManager.onBeforeSceneStart();
				SceneManager._scene.start();
				SceneManager.onSceneStart();
			}
		}
	}

	static isGameActive() {
		// [Note] We use "window.top" to support an iframe.
		try {
			return window.top.document.hasFocus();
		} catch (e) {
			// SecurityError
			return true;
		}
	}

	static onSceneTerminate() {
		SceneManager._previousScene = SceneManager._scene;
		SceneManager._previousClass = SceneManager._scene.constructor;
		Graphics.setStage(null);
	}

	static onSceneCreate() {
		Graphics.startLoading();
	}

	static onBeforeSceneStart() {
		if (SceneManager._previousScene) {
			SceneManager._previousScene.destroy();
			SceneManager._previousScene = null;
		}
		if (Graphics.effekseer) {
			Graphics.effekseer.stopAll();
		}
	}

	static onSceneStart() {
		Graphics.endLoading();
		Graphics.setStage(SceneManager._scene);
	}

	static isSceneChanging() {
		return SceneManager._exiting || !!SceneManager._nextScene;
	}

	static isCurrentSceneBusy() {
		return SceneManager._scene && SceneManager._scene.isBusy();
	}

	static isNextScene(sceneClass) {
		return (
			SceneManager._nextScene &&
			SceneManager._nextScene.constructor === sceneClass
		);
	}

	static isPreviousScene(sceneClass) {
		return SceneManager._previousClass === sceneClass;
	}

	static goto(sceneClass) {
		if (sceneClass) {
			SceneManager._nextScene = new sceneClass();
		}
		if (SceneManager._scene) {
			SceneManager._scene.stop();
		}
	}

	static push(sceneClass) {
		SceneManager._stack.push(SceneManager._scene.constructor);
		SceneManager.goto(sceneClass);
	}

	static pop() {
		if (SceneManager._stack.length > 0) {
			SceneManager.goto(SceneManager._stack.pop());
		} else {
			SceneManager.exit();
		}
	}

	static exit() {
		SceneManager.goto(null);
		SceneManager._exiting = true;
	}

	static clearStack() {
		SceneManager._stack = [];
	}

	static stop() {
		Graphics.stopGameLoop();
	}

	static prepareNextScene() {
		SceneManager._nextScene.prepare(...arguments);
	}

	static snap() {
		return Bitmap.snap(SceneManager._scene);
	}

	static snapForBackground() {
		if (SceneManager._backgroundBitmap) {
			SceneManager._backgroundBitmap.destroy();
		}
		SceneManager._backgroundBitmap = SceneManager.snap();
	}

	static backgroundBitmap() {
		return SceneManager._backgroundBitmap;
	}

	static resume() {
		TouchInput.update();
		Graphics.startGameLoop();
	}
}

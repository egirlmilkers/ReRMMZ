import * as PIXI from "pixi.js";
import { Stage, Utils, Video } from "../core/index.js";

/**
 * The static class that carries out graphics processing.
 *
 * @namespace
 */
export class Graphics {
	constructor() {
		throw new Error("This is a static class");
	}

	/**
	 * Initializes the graphics system.
	 *
	 * @returns {boolean} True if the graphics system is available.
	 */
	static initialize() {
		Graphics._width = 0;
		Graphics._height = 0;
		Graphics._defaultScale = 1;
		Graphics._realScale = 1;
		Graphics._errorPrinter = null;
		Graphics._tickHandler = null;
		Graphics._canvas = null;
		Graphics._fpsCounter = null;
		Graphics._loadingSpinner = null;
		Graphics._stretchEnabled = Graphics._defaultStretchMode();
		Graphics._app = null;
		Graphics._effekseer = null;
		Graphics._wasLoading = false;

		/**
		 * The total frame count of the game screen.
		 *
		 * @type number
		 * @name Graphics.frameCount
		 */
		Graphics.frameCount = 0;

		/**
		 * The width of the window display area.
		 *
		 * @type number
		 * @name Graphics.boxWidth
		 */
		Graphics.boxWidth = Graphics._width;

		/**
		 * The height of the window display area.
		 *
		 * @type number
		 * @name Graphics.boxHeight
		 */
		Graphics.boxHeight = Graphics._height;

		Graphics._updateRealScale();
		Graphics._createAllElements();
		Graphics._disableContextMenu();
		Graphics._setupEventHandlers();
		Graphics._createPixiApp();
		Graphics._createEffekseerContext();

		return !!Graphics._app;
	}

	/**
	 * The PIXI.Application object.
	 *
	 * @readonly
	 * @type PIXI.Application
	 * @name Graphics.app
	 */
	static get app() {
		return Graphics._app;
	}

	/**
	 * The context object of Effekseer.
	 *
	 * @readonly
	 * @type EffekseerContext
	 * @name Graphics.effekseer
	 */
	static get effekseer() {
		return Graphics._effekseer;
	}

	/**
	 * Register a handler for tick events.
	 *
	 * @param {function} handler - The listener function to be added for updates.
	 */
	static setTickHandler(handler) {
		Graphics._tickHandler = handler;
	}

	/**
	 * Starts the game loop.
	 */
	static startGameLoop() {
		if (Graphics._app) {
			Graphics._app.start();
		}
	}

	/**
	 * Stops the game loop.
	 */
	static stopGameLoop() {
		if (Graphics._app) {
			Graphics._app.stop();
		}
	}

	/**
	 * Sets the stage to be rendered.
	 *
	 * @param {Stage} stage - The stage object to be rendered.
	 */
	static setStage(stage) {
		if (Graphics._app) {
			Graphics._app.stage = stage;
		}
	}

	/**
	 * Shows the loading spinner.
	 */
	static startLoading() {
		if (!document.getElementById("loadingSpinner")) {
			document.body.appendChild(Graphics._loadingSpinner);
		}
	}

	/**
	 * Erases the loading spinner.
	 *
	 * @returns {boolean} True if the loading spinner was active.
	 */
	static endLoading() {
		if (document.getElementById("loadingSpinner")) {
			document.body.removeChild(Graphics._loadingSpinner);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Displays the error text to the screen.
	 *
	 * @param {string} name - The name of the error.
	 * @param {string} message - The message of the error.
	 * @param {Error} [error] - The error object.
	 */
	static printError(name, message, error = null) {
		if (!Graphics._errorPrinter) {
			Graphics._createErrorPrinter();
		}
		Graphics._errorPrinter.innerHTML = Graphics._makeErrorHtml(
			name,
			message,
			error,
		);
		Graphics._wasLoading = Graphics.endLoading();
		Graphics._applyCanvasFilter();
	}

	/**
	 * Displays a button to try to reload resources.
	 *
	 * @param {function} retry - The callback function to be called when the button
	 *                           is pressed.
	 */
	static showRetryButton(retry) {
		const button = document.createElement("button");
		button.id = "retryButton";
		button.innerHTML = "Retry";
		// [Note] stopPropagation() is required for iOS Safari.
		button.ontouchstart = (e) => e.stopPropagation();
		button.onclick = () => {
			Graphics.eraseError();
			retry();
		};
		Graphics._errorPrinter.appendChild(button);
		button.focus();
	}

	/**
	 * Erases the loading error text.
	 */
	static eraseError() {
		if (Graphics._errorPrinter) {
			Graphics._errorPrinter.innerHTML = Graphics._makeErrorHtml();
			if (Graphics._wasLoading) {
				Graphics.startLoading();
			}
		}
		Graphics._clearCanvasFilter();
	}

	/**
	 * Converts an x coordinate on the page to the corresponding
	 * x coordinate on the canvas area.
	 *
	 * @param {number} x - The x coordinate on the page to be converted.
	 * @returns {number} The x coordinate on the canvas area.
	 */
	static pageToCanvasX(x) {
		if (Graphics._canvas) {
			const left = Graphics._canvas.offsetLeft;
			return Math.round((x - left) / Graphics._realScale);
		} else {
			return 0;
		}
	}

	/**
	 * Converts a y coordinate on the page to the corresponding
	 * y coordinate on the canvas area.
	 *
	 * @param {number} y - The y coordinate on the page to be converted.
	 * @returns {number} The y coordinate on the canvas area.
	 */
	static pageToCanvasY(y) {
		if (Graphics._canvas) {
			const top = Graphics._canvas.offsetTop;
			return Math.round((y - top) / Graphics._realScale);
		} else {
			return 0;
		}
	}

	/**
	 * Checks whether the specified point is inside the game canvas area.
	 *
	 * @param {number} x - The x coordinate on the canvas area.
	 * @param {number} y - The y coordinate on the canvas area.
	 * @returns {boolean} True if the specified point is inside the game canvas area.
	 */
	static isInsideCanvas(x, y) {
		return x >= 0 && x < Graphics._width && y >= 0 && y < Graphics._height;
	}

	/**
	 * Shows the game screen.
	 */
	static showScreen() {
		Graphics._canvas.style.opacity = 1;
	}

	/**
	 * Hides the game screen.
	 */
	static hideScreen() {
		Graphics._canvas.style.opacity = 0;
	}

	/**
	 * Changes the size of the game screen.
	 *
	 * @param {number} width - The width of the game screen.
	 * @param {number} height - The height of the game screen.
	 */
	static resize(width, height) {
		Graphics._width = width;
		Graphics._height = height;
		Graphics._app.renderer.resize(width, height);
		Graphics._updateAllElements();
	}

	/**
	 * The width of the game screen.
	 *
	 * @type number
	 * @name Graphics.width
	 */
	static get width() {
		return Graphics._width;
	}

	static set width(value) {
		if (Graphics._width !== value) {
			Graphics._width = value;
			Graphics._updateAllElements();
		}
	}

	/**
	 * The height of the game screen.
	 *
	 * @type number
	 * @name Graphics.height
	 */
	static get height() {
		return Graphics._height;
	}

	static set height(value) {
		if (Graphics._height !== value) {
			Graphics._height = value;
			Graphics._updateAllElements();
		}
	}

	/**
	 * The default zoom scale of the game screen.
	 *
	 * @type number
	 * @name Graphics.defaultScale
	 */
	static get defaultScale() {
		return Graphics._defaultScale;
	}

	static set defaultScale(value) {
		if (Graphics._defaultScale !== value) {
			Graphics._defaultScale = value;
			Graphics._updateAllElements();
		}
	}

	static _createAllElements() {
		Graphics._createErrorPrinter();
		Graphics._createCanvas();
		Graphics._createLoadingSpinner();
		Graphics._createFPSCounter();
	}

	static _updateAllElements() {
		Graphics._updateRealScale();
		Graphics._updateErrorPrinter();
		Graphics._updateCanvas();
		Graphics._updateVideo();
	}

	static _onTick(deltaTime) {
		Graphics._fpsCounter.startTick();
		if (Graphics._tickHandler) {
			Graphics._tickHandler(deltaTime);
		}
		if (Graphics._canRender()) {
			Graphics._app.render();
		}
		Graphics._fpsCounter.endTick();
	}

	static _canRender() {
		return !!Graphics._app.stage;
	}

	static _updateRealScale() {
		if (
			Graphics._stretchEnabled &&
			Graphics._width > 0 &&
			Graphics._height > 0
		) {
			const h = Graphics._stretchWidth() / Graphics._width;
			const v = Graphics._stretchHeight() / Graphics._height;
			Graphics._realScale = Math.min(h, v);
			window.scrollTo(0, 0);
		} else {
			Graphics._realScale = Graphics._defaultScale;
		}
	}

	static _stretchWidth() {
		if (Utils.isMobileDevice()) {
			return document.documentElement.clientWidth;
		} else {
			return window.innerWidth;
		}
	}

	static _stretchHeight() {
		if (Utils.isMobileDevice()) {
			// [Note] Mobile browsers often have special operations at the top and
			//   bottom of the screen.
			const rate = Utils.isLocal() ? 1.0 : 0.9;
			return document.documentElement.clientHeight * rate;
		} else {
			return window.innerHeight;
		}
	}

	static _makeErrorHtml(name, message /*, error*/) {
		const nameDiv = document.createElement("div");
		const messageDiv = document.createElement("div");
		nameDiv.id = "errorName";
		messageDiv.id = "errorMessage";
		nameDiv.innerHTML = Utils.escapeHtml(name || "");
		messageDiv.innerHTML = Utils.escapeHtml(message || "");
		return nameDiv.outerHTML + messageDiv.outerHTML;
	}

	static _defaultStretchMode() {
		return Utils.isNwjs() || Utils.isMobileDevice();
	}

	static _createErrorPrinter() {
		Graphics._errorPrinter = document.createElement("div");
		Graphics._errorPrinter.id = "errorPrinter";
		Graphics._errorPrinter.innerHTML = Graphics._makeErrorHtml();
		document.body.appendChild(Graphics._errorPrinter);
	}

	static _updateErrorPrinter() {
		const width = Graphics._width * 0.8 * Graphics._realScale;
		const height = 100 * Graphics._realScale;
		Graphics._errorPrinter.style.width = width + "px";
		Graphics._errorPrinter.style.height = height + "px";
	}

	static _createCanvas() {
		Graphics._canvas = document.createElement("canvas");
		Graphics._canvas.id = "gameCanvas";
		Graphics._updateCanvas();
		document.body.appendChild(Graphics._canvas);
	}

	static _updateCanvas() {
		Graphics._canvas.width = Graphics._width;
		Graphics._canvas.height = Graphics._height;
		Graphics._canvas.style.zIndex = 1;
		Graphics._centerElement(Graphics._canvas);
	}

	static _updateVideo() {
		const width = Graphics._width * Graphics._realScale;
		const height = Graphics._height * Graphics._realScale;
		Video.resize(width, height);
	}

	static _createLoadingSpinner() {
		const loadingSpinner = document.createElement("div");
		const loadingSpinnerImage = document.createElement("div");
		loadingSpinner.id = "loadingSpinner";
		loadingSpinnerImage.id = "loadingSpinnerImage";
		loadingSpinner.appendChild(loadingSpinnerImage);
		Graphics._loadingSpinner = loadingSpinner;
	}

	static _createFPSCounter() {
		Graphics._fpsCounter = new Graphics.FPSCounter();
	}

	static _centerElement(element) {
		const width = element.width * Graphics._realScale;
		const height = element.height * Graphics._realScale;
		element.style.position = "absolute";
		element.style.margin = "auto";
		element.style.top = 0;
		element.style.left = 0;
		element.style.right = 0;
		element.style.bottom = 0;
		element.style.width = width + "px";
		element.style.height = height + "px";
	}

	static _disableContextMenu() {
		const elements = document.body.getElementsByTagName("*");
		const oncontextmenu = () => false;
		for (const element of elements) {
			element.oncontextmenu = oncontextmenu;
		}
	}

	static _applyCanvasFilter() {
		if (Graphics._canvas) {
			Graphics._canvas.style.opacity = 0.5;
			Graphics._canvas.style.filter = "blur(8px)";
			Graphics._canvas.style.webkitFilter = "blur(8px)";
		}
	}

	static _clearCanvasFilter() {
		if (Graphics._canvas) {
			Graphics._canvas.style.opacity = 1;
			Graphics._canvas.style.filter = "";
			Graphics._canvas.style.webkitFilter = "";
		}
	}

	static _setupEventHandlers() {
		window.addEventListener("resize", Graphics._onWindowResize.bind(Graphics));
		document.addEventListener("keydown", Graphics._onKeyDown.bind(Graphics));
	}

	static _onWindowResize() {
		Graphics._updateAllElements();
	}

	static _onKeyDown(event) {
		if (!event.ctrlKey && !event.altKey) {
			switch (event.keyCode) {
				case 113: // F2
					event.preventDefault();
					Graphics._switchFPSCounter();
					break;
				case 114: // F3
					event.preventDefault();
					Graphics._switchStretchMode();
					break;
				case 115: // F4
					event.preventDefault();
					Graphics._switchFullScreen();
					break;
			}
		}
	}

	static _switchFPSCounter() {
		Graphics._fpsCounter.switchMode();
	}

	static _switchStretchMode() {
		Graphics._stretchEnabled = !Graphics._stretchEnabled;
		Graphics._updateAllElements();
	}

	static _switchFullScreen() {
		if (Graphics._isFullScreen()) {
			Graphics._cancelFullScreen();
		} else {
			Graphics._requestFullScreen();
		}
	}

	static _isFullScreen() {
		return (
			document.fullScreenElement ||
			document.mozFullScreen ||
			document.webkitFullscreenElement
		);
	}

	static _requestFullScreen() {
		const element = document.body;
		if (element.requestFullScreen) {
			element.requestFullScreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullScreen) {
			element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	}

	static _cancelFullScreen() {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}

	static _createPixiApp() {
		try {
			Graphics._setupPixi();
			Graphics._app = new PIXI.Application({
				view: Graphics._canvas,
				autoStart: false,
			});
			Graphics._app.ticker.remove(Graphics._app.render, Graphics._app);
			Graphics._app.ticker.add(Graphics._onTick, Graphics);
		} catch (e) {
			Graphics._app = null;
		}
	}

	static _setupPixi() {
		PIXI.utils.skipHello();
		PIXI.settings.GC_MAX_IDLE = 600;
	}

	static _createEffekseerContext() {
		if (Graphics._app && window.effekseer) {
			try {
				Graphics._effekseer = effekseer.createContext();
				if (Graphics._effekseer) {
					Graphics._effekseer.init(Graphics._app.renderer.gl);
					Graphics._effekseer.setRestorationOfStatesFlag(false);
				}
			} catch (e) {
				Graphics._app = null;
			}
		}
	}
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// FPSCounter
//
// This is based on Darsain's FPSMeter which is under the MIT license.
// The original can be found at https://github.com/Darsain/fpsmeter.

Graphics.FPSCounter = class {
	constructor() {
		this._tickCount = 0;
		this._frameTime = 100;
		this._frameStart = 0;
		this._lastLoop = performance.now() - 100;
		this._showFps = true;
		this.fps = 0;
		this.duration = 0;
		this._createElements();
		this._update();
	}

	startTick() {
		this._frameStart = performance.now();
	}

	endTick() {
		const time = performance.now();
		const thisFrameTime = time - this._lastLoop;
		this._frameTime += (thisFrameTime - this._frameTime) / 12;
		this.fps = 1000 / this._frameTime;
		this.duration = Math.max(0, time - this._frameStart);
		this._lastLoop = time;
		if (this._tickCount++ % 15 === 0) {
			this._update();
		}
	}

	switchMode() {
		if (this._boxDiv.style.display === "none") {
			this._boxDiv.style.display = "block";
			this._showFps = true;
		} else if (this._showFps) {
			this._showFps = false;
		} else {
			this._boxDiv.style.display = "none";
		}
		this._update();
	}

	_createElements() {
		this._boxDiv = document.createElement("div");
		this._labelDiv = document.createElement("div");
		this._numberDiv = document.createElement("div");
		this._boxDiv.id = "fpsCounterBox";
		this._labelDiv.id = "fpsCounterLabel";
		this._numberDiv.id = "fpsCounterNumber";
		this._boxDiv.style.display = "none";
		this._boxDiv.appendChild(this._labelDiv);
		this._boxDiv.appendChild(this._numberDiv);
		document.body.appendChild(this._boxDiv);
	}

	_update() {
		const count = this._showFps ? this.fps : this.duration;
		this._labelDiv.textContent = this._showFps ? "FPS" : "ms";
		this._numberDiv.textContent = count.toFixed(0);
	}
};

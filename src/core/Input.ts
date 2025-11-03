/**
 * The static class that handles input data from the keyboard and gamepads.
 *
 * @namespace
 */
export class Input {
	/**
	 * The wait time of the key repeat in frames.
	 *
	 * @type number
	 */
	static keyRepeatWait = 24;

	/**
	 * The interval of the key repeat in frames.
	 *
	 * @type number
	 */
	static keyRepeatInterval = 6;

	/**
	 * A hash table to convert from a virtual key code to a mapped key name.
	 *
	 * @type Object
	 */
	static keyMapper = {
		9: "tab", // tab
		13: "ok", // enter
		16: "shift", // shift
		17: "control", // control
		18: "control", // alt
		27: "escape", // escape
		32: "ok", // space
		33: "pageup", // pageup
		34: "pagedown", // pagedown
		37: "left", // left arrow
		38: "up", // up arrow
		39: "right", // right arrow
		40: "down", // down arrow
		45: "escape", // insert
		81: "pageup", // Q
		87: "pagedown", // W
		88: "escape", // X
		90: "ok", // Z
		96: "escape", // numpad 0
		98: "down", // numpad 2
		100: "left", // numpad 4
		102: "right", // numpad 6
		104: "up", // numpad 8
		120: "debug", // F9
	};

	/**
	 * A hash table to convert from a gamepad button to a mapped key name.
	 *
	 * @type Object
	 */
	static gamepadMapper = {
		0: "ok", // A
		1: "cancel", // B
		2: "shift", // X
		3: "menu", // Y
		4: "pageup", // LB
		5: "pagedown", // RB
		12: "up", // D-pad up
		13: "down", // D-pad down
		14: "left", // D-pad left
		15: "right", // D-pad right
	};

	constructor() {
		throw new Error("This is a static class");
	}

	/**
	 * Initializes the input system.
	 */
	static initialize() {
		Input.clear();
		Input._setupEventHandlers();
	}

	/**
	 * Clears all the input data.
	 */
	static clear() {
		Input._currentState = {};
		Input._previousState = {};
		Input._gamepadStates = [];
		Input._latestButton = null;
		Input._pressedTime = 0;
		Input._dir4 = 0;
		Input._dir8 = 0;
		Input._preferredAxis = "";
		Input._date = 0;
		Input._virtualButton = null;
	}

	/**
	 * Updates the input data.
	 */
	static update() {
		Input._pollGamepads();
		if (Input._currentState[Input._latestButton]) {
			Input._pressedTime++;
		} else {
			Input._latestButton = null;
		}
		for (const name in Input._currentState) {
			if (Input._currentState[name] && !Input._previousState[name]) {
				Input._latestButton = name;
				Input._pressedTime = 0;
				Input._date = Date.now();
			}
			Input._previousState[name] = Input._currentState[name];
		}
		if (Input._virtualButton) {
			Input._latestButton = Input._virtualButton;
			Input._pressedTime = 0;
			Input._virtualButton = null;
		}
		Input._updateDirection();
	}

	/**
	 * Checks whether a key is currently pressed down.
	 *
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is pressed.
	 */
	static isPressed(keyName) {
		if (Input._isEscapeCompatible(keyName) && Input.isPressed("escape")) {
			return true;
		} else {
			return !!Input._currentState[keyName];
		}
	}

	/**
	 * Checks whether a key is just pressed.
	 *
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is triggered.
	 */
	static isTriggered(keyName) {
		if (Input._isEscapeCompatible(keyName) && Input.isTriggered("escape")) {
			return true;
		} else {
			return Input._latestButton === keyName && Input._pressedTime === 0;
		}
	}

	/**
	 * Checks whether a key is just pressed or a key repeat occurred.
	 *
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is repeated.
	 */
	static isRepeated(keyName) {
		if (Input._isEscapeCompatible(keyName) && Input.isRepeated("escape")) {
			return true;
		} else {
			return (
				Input._latestButton === keyName &&
				(Input._pressedTime === 0 ||
					(Input._pressedTime >= Input.keyRepeatWait &&
						Input._pressedTime % Input.keyRepeatInterval === 0))
			);
		}
	}

	/**
	 * Checks whether a key is kept depressed.
	 *
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is long-pressed.
	 */
	static isLongPressed(keyName) {
		if (Input._isEscapeCompatible(keyName) && Input.isLongPressed("escape")) {
			return true;
		} else {
			return (
				Input._latestButton === keyName &&
				Input._pressedTime >= Input.keyRepeatWait
			);
		}
	}

	/**
	 * The four direction value as a number of the numpad, or 0 for neutral.
	 *
	 * @readonly
	 * @type number
	 * @name Input.dir4
	 */
	static get dir4() {
		return Input._dir4;
	}

	/**
	 * The eight direction value as a number of the numpad, or 0 for neutral.
	 *
	 * @readonly
	 * @type number
	 * @name Input.dir8
	 */
	static get dir8() {
		return Input._dir8;
	}

	/**
	 * The time of the last input in milliseconds.
	 *
	 * @readonly
	 * @type number
	 * @name Input.date
	 */
	static get date() {
		return Input._date;
	}

	static virtualClick(buttonName) {
		Input._virtualButton = buttonName;
	}

	static _setupEventHandlers() {
		document.addEventListener("keydown", Input._onKeyDown.bind(Input));
		document.addEventListener("keyup", Input._onKeyUp.bind(Input));
		window.addEventListener("blur", Input._onLostFocus.bind(Input));
	}

	static _onKeyDown(event) {
		if (Input._shouldPreventDefault(event.keyCode)) {
			event.preventDefault();
		}
		if (event.keyCode === 144) {
			// Numlock
			Input.clear();
		}
		const buttonName = Input.keyMapper[event.keyCode];
		if (buttonName) {
			Input._currentState[buttonName] = true;
		}
	}

	static _shouldPreventDefault(keyCode) {
		switch (keyCode) {
			case 8: // backspace
			case 9: // tab
			case 33: // pageup
			case 34: // pagedown
			case 37: // left arrow
			case 38: // up arrow
			case 39: // right arrow
			case 40: // down arrow
				return true;
		}
		return false;
	}

	static _onKeyUp(event) {
		const buttonName = Input.keyMapper[event.keyCode];
		if (buttonName) {
			Input._currentState[buttonName] = false;
		}
	}

	static _onLostFocus() {
		Input.clear();
	}

	static _pollGamepads() {
		if (navigator.getGamepads) {
			const gamepads = navigator.getGamepads();
			if (gamepads) {
				for (const gamepad of gamepads) {
					if (gamepad && gamepad.connected) {
						Input._updateGamepadState(gamepad);
					}
				}
			}
		}
	}

	static _updateGamepadState(gamepad) {
		const lastState = Input._gamepadStates[gamepad.index] || [];
		const newState = [];
		const buttons = gamepad.buttons;
		const axes = gamepad.axes;
		const threshold = 0.5;
		newState[12] = false;
		newState[13] = false;
		newState[14] = false;
		newState[15] = false;
		for (let i = 0; i < buttons.length; i++) {
			newState[i] = buttons[i].pressed;
		}
		if (axes[1] < -threshold) {
			newState[12] = true; // up
		} else if (axes[1] > threshold) {
			newState[13] = true; // down
		}
		if (axes[0] < -threshold) {
			newState[14] = true; // left
		} else if (axes[0] > threshold) {
			newState[15] = true; // right
		}
		for (let j = 0; j < newState.length; j++) {
			if (newState[j] !== lastState[j]) {
				const buttonName = Input.gamepadMapper[j];
				if (buttonName) {
					Input._currentState[buttonName] = newState[j];
				}
			}
		}
		Input._gamepadStates[gamepad.index] = newState;
	}

	static _updateDirection() {
		let x = Input._signX();
		let y = Input._signY();
		Input._dir8 = Input._makeNumpadDirection(x, y);
		if (x !== 0 && y !== 0) {
			if (Input._preferredAxis === "x") {
				y = 0;
			} else {
				x = 0;
			}
		} else if (x !== 0) {
			Input._preferredAxis = "y";
		} else if (y !== 0) {
			Input._preferredAxis = "x";
		}
		Input._dir4 = Input._makeNumpadDirection(x, y);
	}

	static _signX() {
		const left = Input.isPressed("left") ? 1 : 0;
		const right = Input.isPressed("right") ? 1 : 0;
		return right - left;
	}

	static _signY() {
		const up = Input.isPressed("up") ? 1 : 0;
		const down = Input.isPressed("down") ? 1 : 0;
		return down - up;
	}

	static _makeNumpadDirection(x, y) {
		if (x === 0 && y === 0) {
			return 0;
		} else {
			return 5 - y * 3 + x;
		}
	}

	static _isEscapeCompatible(keyName) {
		return keyName === "cancel" || keyName === "menu";
	}
}

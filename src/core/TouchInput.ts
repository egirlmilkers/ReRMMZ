import { Graphics } from "../core/index.js";

/**
 * The static class that handles input data from the mouse and touchscreen.
 *
 * @namespace
 */
export class TouchInput {
	/**
	 * The wait time of the pseudo key repeat in frames.
	 *
	 * @type number
	 */
	static keyRepeatWait = 24;

	/**
	 * The interval of the pseudo key repeat in frames.
	 *
	 * @type number
	 */
	static keyRepeatInterval = 6;

	/**
	 * The threshold number of pixels to treat as moved.
	 *
	 * @type number
	 */
	static moveThreshold = 10;

	constructor() {
		throw new Error("This is a static class");
	}

	/**
	 * Initializes the touch system.
	 */
	static initialize() {
		TouchInput.clear();
		TouchInput._setupEventHandlers();
	}

	/**
	 * Clears all the touch data.
	 */
	static clear() {
		TouchInput._mousePressed = false;
		TouchInput._screenPressed = false;
		TouchInput._pressedTime = 0;
		TouchInput._clicked = false;
		TouchInput._newState = TouchInput._createNewState();
		TouchInput._currentState = TouchInput._createNewState();
		TouchInput._x = 0;
		TouchInput._y = 0;
		TouchInput._triggerX = 0;
		TouchInput._triggerY = 0;
		TouchInput._moved = false;
		TouchInput._date = 0;
	}

	/**
	 * Updates the touch data.
	 */
	static update() {
		TouchInput._currentState = TouchInput._newState;
		TouchInput._newState = TouchInput._createNewState();
		TouchInput._clicked =
			TouchInput._currentState.released && !TouchInput._moved;
		if (TouchInput.isPressed()) {
			TouchInput._pressedTime++;
		}
	}

	/**
	 * Checks whether the mouse button or touchscreen has been pressed and
	 * released at the same position.
	 *
	 * @returns {boolean} True if the mouse button or touchscreen is clicked.
	 */
	static isClicked() {
		return TouchInput._clicked;
	}

	/**
	 * Checks whether the mouse button or touchscreen is currently pressed down.
	 *
	 * @returns {boolean} True if the mouse button or touchscreen is pressed.
	 */
	static isPressed() {
		return TouchInput._mousePressed || TouchInput._screenPressed;
	}

	/**
	 * Checks whether the left mouse button or touchscreen is just pressed.
	 *
	 * @returns {boolean} True if the mouse button or touchscreen is triggered.
	 */
	static isTriggered() {
		return TouchInput._currentState.triggered;
	}

	/**
	 * Checks whether the left mouse button or touchscreen is just pressed
	 * or a pseudo key repeat occurred.
	 *
	 * @returns {boolean} True if the mouse button or touchscreen is repeated.
	 */
	static isRepeated() {
		return (
			TouchInput.isPressed() &&
			(TouchInput._currentState.triggered ||
				(TouchInput._pressedTime >= TouchInput.keyRepeatWait &&
					TouchInput._pressedTime % TouchInput.keyRepeatInterval === 0))
		);
	}

	/**
	 * Checks whether the left mouse button or touchscreen is kept depressed.
	 *
	 * @returns {boolean} True if the left mouse button or touchscreen is long-pressed.
	 */
	static isLongPressed() {
		return (
			TouchInput.isPressed() &&
			TouchInput._pressedTime >= TouchInput.keyRepeatWait
		);
	}

	/**
	 * Checks whether the right mouse button is just pressed.
	 *
	 * @returns {boolean} True if the right mouse button is just pressed.
	 */
	static isCancelled() {
		return TouchInput._currentState.cancelled;
	}

	/**
	 * Checks whether the mouse or a finger on the touchscreen is moved.
	 *
	 * @returns {boolean} True if the mouse or a finger on the touchscreen is moved.
	 */
	static isMoved() {
		return TouchInput._currentState.moved;
	}

	/**
	 * Checks whether the mouse is moved without pressing a button.
	 *
	 * @returns {boolean} True if the mouse is hovered.
	 */
	static isHovered() {
		return TouchInput._currentState.hovered;
	}

	/**
	 * Checks whether the left mouse button or touchscreen is released.
	 *
	 * @returns {boolean} True if the mouse button or touchscreen is released.
	 */
	static isReleased() {
		return TouchInput._currentState.released;
	}

	/**
	 * The horizontal scroll amount.
	 *
	 * @readonly
	 * @type number
	 * @name TouchInput.wheelX
	 */
	static get wheelX() {
		return TouchInput._currentState.wheelX;
	}

	/**
	 * The vertical scroll amount.
	 *
	 * @readonly
	 * @type number
	 * @name TouchInput.wheelY
	 */
	static get wheelY() {
		return TouchInput._currentState.wheelY;
	}

	/**
	 * The x coordinate on the canvas area of the latest touch event.
	 *
	 * @readonly
	 * @type number
	 * @name TouchInput.x
	 */
	static get x() {
		return TouchInput._x;
	}

	/**
	 * The y coordinate on the canvas area of the latest touch event.
	 *
	 * @readonly
	 * @type number
	 * @name TouchInput.y
	 */
	static get y() {
		return TouchInput._y;
	}

	/**
	 * The time of the last input in milliseconds.
	 *
	 * @readonly
	 * @type number
	 * @name TouchInput.date
	 */
	static get date() {
		return TouchInput._date;
	}

	static _createNewState() {
		return {
			triggered: false,
			cancelled: false,
			moved: false,
			hovered: false,
			released: false,
			wheelX: 0,
			wheelY: 0,
		};
	}

	static _setupEventHandlers() {
		const pf = { passive: false };
		document.addEventListener(
			"mousedown",
			TouchInput._onMouseDown.bind(TouchInput),
		);
		document.addEventListener(
			"mousemove",
			TouchInput._onMouseMove.bind(TouchInput),
		);
		document.addEventListener(
			"mouseup",
			TouchInput._onMouseUp.bind(TouchInput),
		);
		document.addEventListener(
			"wheel",
			TouchInput._onWheel.bind(TouchInput),
			pf,
		);
		document.addEventListener(
			"touchstart",
			TouchInput._onTouchStart.bind(TouchInput),
			pf,
		);
		document.addEventListener(
			"touchmove",
			TouchInput._onTouchMove.bind(TouchInput),
			pf,
		);
		document.addEventListener(
			"touchend",
			TouchInput._onTouchEnd.bind(TouchInput),
		);
		document.addEventListener(
			"touchcancel",
			TouchInput._onTouchCancel.bind(TouchInput),
		);
		window.addEventListener("blur", TouchInput._onLostFocus.bind(TouchInput));
	}

	static _onMouseDown(event) {
		if (event.button === 0) {
			TouchInput._onLeftButtonDown(event);
		} else if (event.button === 1) {
			TouchInput._onMiddleButtonDown(event);
		} else if (event.button === 2) {
			TouchInput._onRightButtonDown(event);
		}
	}

	static _onLeftButtonDown(event) {
		const x = Graphics.pageToCanvasX(event.pageX);
		const y = Graphics.pageToCanvasY(event.pageY);
		if (Graphics.isInsideCanvas(x, y)) {
			TouchInput._mousePressed = true;
			TouchInput._pressedTime = 0;
			TouchInput._onTrigger(x, y);
		}
	}

	static _onMiddleButtonDown() /*event*/ {
		//
	}

	static _onRightButtonDown(event) {
		const x = Graphics.pageToCanvasX(event.pageX);
		const y = Graphics.pageToCanvasY(event.pageY);
		if (Graphics.isInsideCanvas(x, y)) {
			TouchInput._onCancel(x, y);
		}
	}

	static _onMouseMove(event) {
		const x = Graphics.pageToCanvasX(event.pageX);
		const y = Graphics.pageToCanvasY(event.pageY);
		if (TouchInput._mousePressed) {
			TouchInput._onMove(x, y);
		} else if (Graphics.isInsideCanvas(x, y)) {
			TouchInput._onHover(x, y);
		}
	}

	static _onMouseUp(event) {
		if (event.button === 0) {
			const x = Graphics.pageToCanvasX(event.pageX);
			const y = Graphics.pageToCanvasY(event.pageY);
			TouchInput._mousePressed = false;
			TouchInput._onRelease(x, y);
		}
	}

	static _onWheel(event) {
		TouchInput._newState.wheelX += event.deltaX;
		TouchInput._newState.wheelY += event.deltaY;
		event.preventDefault();
	}

	static _onTouchStart(event) {
		for (const touch of event.changedTouches) {
			const x = Graphics.pageToCanvasX(touch.pageX);
			const y = Graphics.pageToCanvasY(touch.pageY);
			if (Graphics.isInsideCanvas(x, y)) {
				TouchInput._screenPressed = true;
				TouchInput._pressedTime = 0;
				if (event.touches.length >= 2) {
					TouchInput._onCancel(x, y);
				} else {
					TouchInput._onTrigger(x, y);
				}
				event.preventDefault();
			}
		}
		if (window.cordova || window.navigator.standalone) {
			event.preventDefault();
		}
	}

	static _onTouchMove(event) {
		for (const touch of event.changedTouches) {
			const x = Graphics.pageToCanvasX(touch.pageX);
			const y = Graphics.pageToCanvasY(touch.pageY);
			TouchInput._onMove(x, y);
		}
	}

	static _onTouchEnd(event) {
		for (const touch of event.changedTouches) {
			const x = Graphics.pageToCanvasX(touch.pageX);
			const y = Graphics.pageToCanvasY(touch.pageY);
			TouchInput._screenPressed = false;
			TouchInput._onRelease(x, y);
		}
	}

	static _onTouchCancel() /*event*/ {
		TouchInput._screenPressed = false;
	}

	static _onLostFocus() {
		TouchInput.clear();
	}

	static _onTrigger(x, y) {
		TouchInput._newState.triggered = true;
		TouchInput._x = x;
		TouchInput._y = y;
		TouchInput._triggerX = x;
		TouchInput._triggerY = y;
		TouchInput._moved = false;
		TouchInput._date = Date.now();
	}

	static _onCancel(x, y) {
		TouchInput._newState.cancelled = true;
		TouchInput._x = x;
		TouchInput._y = y;
	}

	static _onMove(x, y) {
		const dx = Math.abs(x - TouchInput._triggerX);
		const dy = Math.abs(y - TouchInput._triggerY);
		if (dx > TouchInput.moveThreshold || dy > TouchInput.moveThreshold) {
			TouchInput._moved = true;
		}
		if (TouchInput._moved) {
			TouchInput._newState.moved = true;
			TouchInput._x = x;
			TouchInput._y = y;
		}
	}

	static _onHover(x, y) {
		TouchInput._newState.hovered = true;
		TouchInput._x = x;
		TouchInput._y = y;
	}

	static _onRelease(x, y) {
		TouchInput._newState.released = true;
		TouchInput._x = x;
		TouchInput._y = y;
	}
}

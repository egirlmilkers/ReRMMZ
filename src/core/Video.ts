import { Graphics } from "../core/index.js";

/**
 * The static class that handles video playback.
 *
 * @namespace
 */
export class Video {
	constructor() {
		throw new Error("This is a static class");
	}

	/**
	 * Initializes the video system.
	 *
	 * @param {number} width - The width of the video.
	 * @param {number} height - The height of the video.
	 */
	static initialize(width, height) {
		Video._element = null;
		Video._loading = false;
		Video._volume = 1;
		Video._createElement();
		Video._setupEventHandlers();
		Video.resize(width, height);
	}

	/**
	 * Changes the display size of the video.
	 *
	 * @param {number} width - The width of the video.
	 * @param {number} height - The height of the video.
	 */
	static resize(width, height) {
		if (Video._element) {
			Video._element.style.width = width + "px";
			Video._element.style.height = height + "px";
		}
	}

	/**
	 * Starts playback of a video.
	 *
	 * @param {string} src - The url of the video.
	 */
	static play(src) {
		Video._element.src = src;
		Video._element.onloadeddata = Video._onLoad.bind(Video);
		Video._element.onerror = Video._onError.bind(Video);
		Video._element.onended = Video._onEnd.bind(Video);
		Video._element.load();
		Video._loading = true;
	}

	/**
	 * Checks whether the video is playing.
	 *
	 * @returns {boolean} True if the video is playing.
	 */
	static isPlaying() {
		return Video._loading || Video._isVisible();
	}

	/**
	 * Sets the volume for videos.
	 *
	 * @param {number} volume - The volume for videos (0 to 1).
	 */
	static setVolume(volume) {
		Video._volume = volume;
		if (Video._element) {
			Video._element.volume = Video._volume;
		}
	}

	static _createElement() {
		Video._element = document.createElement("video");
		Video._element.id = "gameVideo";
		Video._element.style.position = "absolute";
		Video._element.style.margin = "auto";
		Video._element.style.top = 0;
		Video._element.style.left = 0;
		Video._element.style.right = 0;
		Video._element.style.bottom = 0;
		Video._element.style.opacity = 0;
		Video._element.style.zIndex = 2;
		Video._element.setAttribute("playsinline", "");
		Video._element.oncontextmenu = () => false;
		document.body.appendChild(Video._element);
	}

	static _onLoad() {
		Video._element.volume = Video._volume;
		Video._element.play();
		Video._updateVisibility(true);
		Video._loading = false;
	}

	static _onError() {
		Video._updateVisibility(false);
		const retry = () => {
			Video._element.load();
		};
		throw ["LoadError", Video._element.src, retry];
	}

	static _onEnd() {
		Video._updateVisibility(false);
	}

	static _updateVisibility(videoVisible) {
		if (videoVisible) {
			Graphics.hideScreen();
		} else {
			Graphics.showScreen();
		}
		Video._element.style.opacity = videoVisible ? 1 : 0;
	}

	static _isVisible() {
		return Video._element.style.opacity > 0;
	}

	static _setupEventHandlers() {
		const onUserGesture = Video._onUserGesture.bind(Video);
		document.addEventListener("keydown", onUserGesture);
		document.addEventListener("mousedown", onUserGesture);
		document.addEventListener("touchend", onUserGesture);
	}

	static _onUserGesture() {
		if (!Video._element.src && Video._element.paused) {
			Video._element.play().catch(() => 0);
		}
	}
}

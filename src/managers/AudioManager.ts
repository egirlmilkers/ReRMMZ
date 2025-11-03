// AudioManager
//
// The static class that handles BGM, BGS, ME and SE.

import { Graphics, Utils, WebAudio } from "../core/index.js";

export class AudioManager {
	static _bgmVolume = 100;
	static _bgsVolume = 100;
	static _meVolume = 100;
	static _seVolume = 100;
	static _currentBgm = null;
	static _currentBgs = null;
	static _bgmBuffer = null;
	static _bgsBuffer = null;
	static _meBuffer = null;
	static _seBuffers = [];
	static _staticBuffers = [];
	static _replayFadeTime = 0.5;
	static _path = "assets/audio/";

	constructor() {
		throw new Error("This is a static class");
	}

	static get bgmVolume() {
		return AudioManager._bgmVolume;
	}

	static set bgmVolume(value) {
		AudioManager._bgmVolume = value;
		AudioManager.updateBgmParameters(AudioManager._currentBgm);
	}

	static get bgsVolume() {
		return AudioManager._bgsVolume;
	}

	static set bgsVolume(value) {
		AudioManager._bgsVolume = value;
		AudioManager.updateBgsParameters(AudioManager._currentBgs);
	}

	static get meVolume() {
		return AudioManager._meVolume;
	}

	static set meVolume(value) {
		AudioManager._meVolume = value;
		AudioManager.updateMeParameters(AudioManager._currentMe);
	}

	static get seVolume() {
		return AudioManager._seVolume;
	}

	static set seVolume(value) {
		AudioManager._seVolume = value;
	}

	static playBgm(bgm, pos) {
		if (AudioManager.isCurrentBgm(bgm)) {
			AudioManager.updateBgmParameters(bgm);
		} else {
			AudioManager.stopBgm();
			if (bgm.name) {
				AudioManager._bgmBuffer = AudioManager.createBuffer("bgm/", bgm.name);
				AudioManager.updateBgmParameters(bgm);
				if (!AudioManager._meBuffer) {
					AudioManager._bgmBuffer.play(true, pos || 0);
				}
			}
		}
		AudioManager.updateCurrentBgm(bgm, pos);
	}

	static replayBgm(bgm) {
		if (AudioManager.isCurrentBgm(bgm)) {
			AudioManager.updateBgmParameters(bgm);
		} else {
			AudioManager.playBgm(bgm, bgm.pos);
			if (AudioManager._bgmBuffer) {
				AudioManager._bgmBuffer.fadeIn(AudioManager._replayFadeTime);
			}
		}
	}

	static isCurrentBgm(bgm) {
		return (
			AudioManager._currentBgm &&
			AudioManager._bgmBuffer &&
			AudioManager._currentBgm.name === bgm.name
		);
	}

	static updateBgmParameters(bgm) {
		AudioManager.updateBufferParameters(
			AudioManager._bgmBuffer,
			AudioManager._bgmVolume,
			bgm,
		);
	}

	static updateCurrentBgm(bgm, pos) {
		AudioManager._currentBgm = {
			name: bgm.name,
			volume: bgm.volume,
			pitch: bgm.pitch,
			pan: bgm.pan,
			pos: pos,
		};
	}

	static stopBgm() {
		if (AudioManager._bgmBuffer) {
			AudioManager._bgmBuffer.destroy();
			AudioManager._bgmBuffer = null;
			AudioManager._currentBgm = null;
		}
	}

	static fadeOutBgm(duration) {
		if (AudioManager._bgmBuffer && AudioManager._currentBgm) {
			AudioManager._bgmBuffer.fadeOut(duration);
			AudioManager._currentBgm = null;
		}
	}

	static fadeInBgm(duration) {
		if (AudioManager._bgmBuffer && AudioManager._currentBgm) {
			AudioManager._bgmBuffer.fadeIn(duration);
		}
	}

	static playBgs(bgs, pos) {
		if (AudioManager.isCurrentBgs(bgs)) {
			AudioManager.updateBgsParameters(bgs);
		} else {
			AudioManager.stopBgs();
			if (bgs.name) {
				AudioManager._bgsBuffer = AudioManager.createBuffer("bgs/", bgs.name);
				AudioManager.updateBgsParameters(bgs);
				AudioManager._bgsBuffer.play(true, pos || 0);
			}
		}
		AudioManager.updateCurrentBgs(bgs, pos);
	}

	static replayBgs(bgs) {
		if (AudioManager.isCurrentBgs(bgs)) {
			AudioManager.updateBgsParameters(bgs);
		} else {
			AudioManager.playBgs(bgs, bgs.pos);
			if (AudioManager._bgsBuffer) {
				AudioManager._bgsBuffer.fadeIn(AudioManager._replayFadeTime);
			}
		}
	}

	static isCurrentBgs(bgs) {
		return (
			AudioManager._currentBgs &&
			AudioManager._bgsBuffer &&
			AudioManager._currentBgs.name === bgs.name
		);
	}

	static updateBgsParameters(bgs) {
		AudioManager.updateBufferParameters(
			AudioManager._bgsBuffer,
			AudioManager._bgsVolume,
			bgs,
		);
	}

	static updateCurrentBgs(bgs, pos) {
		AudioManager._currentBgs = {
			name: bgs.name,
			volume: bgs.volume,
			pitch: bgs.pitch,
			pan: bgs.pan,
			pos: pos,
		};
	}

	static stopBgs() {
		if (AudioManager._bgsBuffer) {
			AudioManager._bgsBuffer.destroy();
			AudioManager._bgsBuffer = null;
			AudioManager._currentBgs = null;
		}
	}

	static fadeOutBgs(duration) {
		if (AudioManager._bgsBuffer && AudioManager._currentBgs) {
			AudioManager._bgsBuffer.fadeOut(duration);
			AudioManager._currentBgs = null;
		}
	}

	static fadeInBgs(duration) {
		if (AudioManager._bgsBuffer && AudioManager._currentBgs) {
			AudioManager._bgsBuffer.fadeIn(duration);
		}
	}

	static playMe(me) {
		AudioManager.stopMe();
		if (me.name) {
			if (AudioManager._bgmBuffer && AudioManager._currentBgm) {
				AudioManager._currentBgm.pos = AudioManager._bgmBuffer.seek();
				AudioManager._bgmBuffer.stop();
			}
			AudioManager._meBuffer = AudioManager.createBuffer("me/", me.name);
			AudioManager.updateMeParameters(me);
			AudioManager._meBuffer.play(false);
			AudioManager._meBuffer.addStopListener(
				AudioManager.stopMe.bind(AudioManager),
			);
		}
	}

	static updateMeParameters(me) {
		AudioManager.updateBufferParameters(
			AudioManager._meBuffer,
			AudioManager._meVolume,
			me,
		);
	}

	static fadeOutMe(duration) {
		if (AudioManager._meBuffer) {
			AudioManager._meBuffer.fadeOut(duration);
		}
	}

	static stopMe() {
		if (AudioManager._meBuffer) {
			AudioManager._meBuffer.destroy();
			AudioManager._meBuffer = null;
			if (
				AudioManager._bgmBuffer &&
				AudioManager._currentBgm &&
				!AudioManager._bgmBuffer.isPlaying()
			) {
				AudioManager._bgmBuffer.play(true, AudioManager._currentBgm.pos);
				AudioManager._bgmBuffer.fadeIn(AudioManager._replayFadeTime);
			}
		}
	}

	static playSe(se) {
		if (se.name) {
			// [Note] Do not play the same sound in the same frame.
			const latestBuffers = AudioManager._seBuffers.filter(
				(buffer) => buffer.frameCount === Graphics.frameCount,
			);
			if (latestBuffers.find((buffer) => buffer.name === se.name)) {
				return;
			}
			const buffer = AudioManager.createBuffer("se/", se.name);
			AudioManager.updateSeParameters(buffer, se);
			buffer.play(false);
			AudioManager._seBuffers.push(buffer);
			AudioManager.cleanupSe();
		}
	}

	static updateSeParameters(buffer, se) {
		AudioManager.updateBufferParameters(buffer, AudioManager._seVolume, se);
	}

	static cleanupSe() {
		for (const buffer of AudioManager._seBuffers) {
			if (!buffer.isPlaying()) {
				buffer.destroy();
			}
		}
		AudioManager._seBuffers = AudioManager._seBuffers.filter((buffer) =>
			buffer.isPlaying(),
		);
	}

	static stopSe() {
		for (const buffer of AudioManager._seBuffers) {
			buffer.destroy();
		}
		AudioManager._seBuffers = [];
	}

	static playStaticSe(se) {
		if (se.name) {
			AudioManager.loadStaticSe(se);
			for (const buffer of AudioManager._staticBuffers) {
				if (buffer.name === se.name) {
					buffer.stop();
					AudioManager.updateSeParameters(buffer, se);
					buffer.play(false);
					break;
				}
			}
		}
	}

	static loadStaticSe(se) {
		if (se.name && !AudioManager.isStaticSe(se)) {
			const buffer = AudioManager.createBuffer("se/", se.name);
			AudioManager._staticBuffers.push(buffer);
		}
	}

	static isStaticSe(se) {
		for (const buffer of AudioManager._staticBuffers) {
			if (buffer.name === se.name) {
				return true;
			}
		}
		return false;
	}

	static stopAll() {
		AudioManager.stopMe();
		AudioManager.stopBgm();
		AudioManager.stopBgs();
		AudioManager.stopSe();
	}

	static saveBgm() {
		if (AudioManager._currentBgm) {
			const bgm = AudioManager._currentBgm;
			return {
				name: bgm.name,
				volume: bgm.volume,
				pitch: bgm.pitch,
				pan: bgm.pan,
				pos: AudioManager._bgmBuffer ? AudioManager._bgmBuffer.seek() : 0,
			};
		} else {
			return AudioManager.makeEmptyAudioObject();
		}
	}

	static saveBgs() {
		if (AudioManager._currentBgs) {
			const bgs = AudioManager._currentBgs;
			return {
				name: bgs.name,
				volume: bgs.volume,
				pitch: bgs.pitch,
				pan: bgs.pan,
				pos: AudioManager._bgsBuffer ? AudioManager._bgsBuffer.seek() : 0,
			};
		} else {
			return AudioManager.makeEmptyAudioObject();
		}
	}

	static makeEmptyAudioObject() {
		return { name: "", volume: 0, pitch: 0 };
	}

	static createBuffer(folder, name) {
		const ext = AudioManager.audioFileExt();
		const url = AudioManager._path + folder + Utils.encodeURI(name) + ext;
		const buffer = new WebAudio(url);
		buffer.name = name;
		buffer.frameCount = Graphics.frameCount;
		return buffer;
	}

	static updateBufferParameters(buffer, configVolume, audio) {
		if (buffer && audio) {
			buffer.volume = (configVolume * (audio.volume || 0)) / 10000;
			buffer.pitch = (audio.pitch || 0) / 100;
			buffer.pan = (audio.pan || 0) / 100;
		}
	}

	static audioFileExt() {
		return ".ogg";
	}

	static checkErrors() {
		const buffers = [
			AudioManager._bgmBuffer,
			AudioManager._bgsBuffer,
			AudioManager._meBuffer,
		];
		buffers.push(...AudioManager._seBuffers);
		buffers.push(...AudioManager._staticBuffers);
		for (const buffer of buffers) {
			if (buffer && buffer.isError()) {
				AudioManager.throwLoadError(buffer);
			}
		}
	}

	static throwLoadError(webAudio) {
		const retry = webAudio.retry.bind(webAudio);
		throw ["LoadError", webAudio.url, retry];
	}
}

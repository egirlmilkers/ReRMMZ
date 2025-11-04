// Game_SelfSwitches
//
// The game object class for self switches.

import { DataManager } from "../managers/DataManager";

export class Game_SelfSwitches {
	constructor() {
		this.clear();
	}

	clear() {
		this._data = {};
	}

	value(key) {
		return !!this._data[key];
	}

	setValue(key, value) {
		if (value) {
			this._data[key] = true;
		} else {
			delete this._data[key];
		}
		this.onChange();
	}

	onChange() {
		DataManager.$gameMap.requestRefresh();
	}
}

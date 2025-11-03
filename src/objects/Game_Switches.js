// Game_Switches
//
// The game object class for switches.

import { DataManager } from '../managers/index.js';

export class Game_Switches {
    constructor() {
        this.clear();
    }

    clear() {
        this._data = [];
    }

    value(switchId) {
        return !!this._data[switchId];
    }

    setValue(switchId, value) {
        if (switchId > 0 && switchId < DataManager.$dataSystem.switches.length) {
            this._data[switchId] = value;
            this.onChange();
        }
    }

    onChange() {
        DataManager.$gameMap.requestRefresh();
    }
}

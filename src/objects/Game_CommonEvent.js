// Game_CommonEvent
//
// The game object class for a common event. It contains functionality for
// running parallel process events.

import { DataManager } from "../managers/DataManager";

import { Game_Interpreter } from "./Game_Interpreter";


export class Game_CommonEvent {
    constructor(commonEventId) {
        this._commonEventId = commonEventId;
        this.refresh();
    }

    event() {
        return DataManager.$dataCommonEvents[this._commonEventId];
    }

    list() {
        return this.event().list;
    }

    refresh() {
        if (this.isActive()) {
            if (!this._interpreter) {
                this._interpreter = new Game_Interpreter();
            }
        } else {
            this._interpreter = null;
        }
    }

    isActive() {
        const event = this.event();
        return event.trigger === 2 && DataManager.$gameSwitches.value(event.switchId);
    }

    update() {
        if (this._interpreter) {
            if (!this._interpreter.isRunning()) {
                this._interpreter.setup(this.list());
            }
            this._interpreter.update();
        }
    }
}

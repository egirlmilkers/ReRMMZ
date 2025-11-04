// Window_DebugRange
//
// The window for selecting a block of switches/variables on the debug screen.

import { Input } from '../core/index.js';
import { DataManager } from '../managers/index.js';
import { Window_Selectable } from './Window_Selectable.js';

export class Window_DebugRange extends Window_Selectable {
	static lastTopRow = 0;
	static lastIndex = 0;

    constructor(rect) {
        this._maxSwitches = Math.ceil((DataManager.$dataSystem.switches.length - 1) / 10);
        this._maxVariables = Math.ceil((DataManager.$dataSystem.variables.length - 1) / 10);
        super(rect);
        this.refresh();
        this.setTopRow(Window_DebugRange.lastTopRow);
        this.select(Window_DebugRange.lastIndex);
        this.activate();
    }

    maxItems() {
        return this._maxSwitches + this._maxVariables;
    }

    update() {
        super.update();
        if (this._editWindow) {
            const index = this.index();
            this._editWindow.setMode(this.mode(index));
            this._editWindow.setTopId(this.topId(index));
        }
    }

    mode(index) {
        return this.isSwitchMode(index) ? "switch" : "variable";
    }

    topId(index) {
        if (this.isSwitchMode(index)) {
            return index * 10 + 1;
        } else {
            return (index - this._maxSwitches) * 10 + 1;
        }
    }

    isSwitchMode(index) {
        return index < this._maxSwitches;
    }

    drawItem(index) {
        const rect = this.itemLineRect(index);
        const c = this.isSwitchMode(index) ? "S" : "V";
        const start = this.topId(index);
        const end = start + 9;
        const text = c + " [" + start.padZero(4) + "-" + end.padZero(4) + "]";
        this.drawText(text, rect.x, rect.y, rect.width);
    }

    isCancelTriggered() {
        return Window_Selectable.prototype.isCancelTriggered() || Input.isTriggered("debug");
    }

    processCancel() {
        super.processCancel();
        Window_DebugRange.lastTopRow = this.topRow();
        Window_DebugRange.lastIndex = this.index();
    }

    setEditWindow(editWindow) {
        this._editWindow = editWindow;
    }
}

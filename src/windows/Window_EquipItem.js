// Window_EquipItem
//
// The window for selecting an equipment item on the equipment screen.

import { JsonEx } from '../core/index.js';
import { Window_ItemList } from '../windows/index.js';

export class Window_EquipItem extends Window_ItemList {
    constructor(rect) {
        super(rect);
        this._actor = null;
        this._slotId = 0;
    }

    maxCols() {
        return 1;
    }

    colSpacing() {
        return 8;
    }

    setActor(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.scrollTo(0, 0);
        }
    }

    setSlotId(slotId) {
        if (this._slotId !== slotId) {
            this._slotId = slotId;
            this.refresh();
            this.scrollTo(0, 0);
        }
    }

    includes(item) {
        if (item === null) {
            return true;
        }
        return this._actor && this._actor.canEquip(item) && item.etypeId === this.etypeId();
    }

    etypeId() {
        if (this._actor && this._slotId >= 0) {
            return this._actor.equipSlots()[this._slotId];
        } else {
            return 0;
        }
    }

    isEnabled() /*item*/{
        return true;
    }

    selectLast() {
        //
    }

    setStatusWindow(statusWindow) {
        this._statusWindow = statusWindow;
        this.callUpdateHelp();
    }

    updateHelp() {
        super.updateHelp();
        if (this._actor && this._statusWindow && this._slotId >= 0) {
            const actor = JsonEx.makeDeepCopy(this._actor);
            actor.forceChangeEquip(this._slotId, this.item());
            this._statusWindow.setTempActor(actor);
        }
    }

    playOkSound() {
        //
    }
}

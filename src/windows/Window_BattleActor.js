// Window_BattleActor
//
// The window for selecting a target actor on the battle screen.

import { DataManager } from '../managers/index.js';
import { Window_BattleStatus } from './Window_BattleStatus.js';

export class Window_BattleActor extends Window_BattleStatus {
    constructor(rect) {
        super(rect);
        this.openness = 255;
        this.hide();
    }

    show() {
        this.forceSelect(0);
        DataManager.$gameTemp.clearTouchState();
        super.show();
    }

    hide() {
        super.hide();
        DataManager.$gameParty.select(null);
    }

    select(index) {
        super.select(index);
        DataManager.$gameParty.select(this.actor(index));
    }

    processTouch() {
        super.processTouch();
        if (this.isOpenAndActive()) {
            const target = DataManager.$gameTemp.touchTarget();
            if (target) {
                const members = DataManager.$gameParty.battleMembers();
                if (members.includes(target)) {
                    this.select(members.indexOf(target));
                    if (DataManager.$gameTemp.touchState() === "click") {
                        this.processOk();
                    }
                }
                DataManager.$gameTemp.clearTouchState();
            }
        }
    }
}

// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.

import { DataManager } from 'src/managers/DataManager.js';

import { Window_ItemList } from './Window_ItemList.js';

export class Window_BattleItem extends Window_ItemList {
    constructor(rect) {
        super(rect);
        this.hide();
    }

    includes(item) {
        return DataManager.$gameParty.canUse(item);
    }

    show() {
        this.selectLast();
        this.showHelpWindow();
        super.show();
    }

    hide() {
        this.hideHelpWindow();
        super.hide();
    }
}

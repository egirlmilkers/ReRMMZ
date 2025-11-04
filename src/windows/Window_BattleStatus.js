// Window_BattleStatus
//
// The window for displaying the status of party members on the battle screen.

import { DataManager } from 'src/managers/DataManager.js';
import { ImageManager } from 'src/managers/ImageManager.js';

import { Window_StatusBase } from './Window_StatusBase.js';

export class Window_BattleStatus extends Window_StatusBase {
    constructor(rect) {
        super(rect);
        this.frameVisible = false;
        this.openness = 0;
        this._bitmapsReady = 0;
        this.preparePartyRefresh();
    }

    extraHeight() {
        return 10;
    }

    maxCols() {
        return 4;
    }

    itemHeight() {
        return this.innerHeight;
    }

    maxItems() {
        return DataManager.$gameParty.battleMembers().length;
    }

    rowSpacing() {
        return 0;
    }

    updatePadding() {
        this.padding = 8;
    }

    actor(index) {
        return DataManager.$gameParty.battleMembers()[index];
    }

    selectActor(actor) {
        const members = DataManager.$gameParty.battleMembers();
        this.select(members.indexOf(actor));
    }

    update() {
        super.update();
        if (DataManager.$gameTemp.isBattleRefreshRequested()) {
            this.preparePartyRefresh();
        }
    }

    preparePartyRefresh() {
        DataManager.$gameTemp.clearBattleRefreshRequest();
        this._bitmapsReady = 0;
        for (const actor of DataManager.$gameParty.members()) {
            const bitmap = ImageManager.loadFace(actor.faceName());
            bitmap.addLoadListener(this.performPartyRefresh.bind(this));
        }
    }

    performPartyRefresh() {
        this._bitmapsReady++;
        if (this._bitmapsReady >= DataManager.$gameParty.members().length) {
            this.refresh();
        }
    }

    drawItem(index) {
        this.drawItemImage(index);
        this.drawItemStatus(index);
    }

    drawItemImage(index) {
        const actor = this.actor(index);
        const rect = this.faceRect(index);
        this.drawActorFace(actor, rect.x, rect.y, rect.width, rect.height);
    }

    drawItemStatus(index) {
        const actor = this.actor(index);
        const rect = this.itemRectWithPadding(index);
        const nameX = this.nameX(rect);
        const nameY = this.nameY(rect);
        const stateIconX = this.stateIconX(rect);
        const stateIconY = this.stateIconY(rect);
        const basicGaugesX = this.basicGaugesX(rect);
        const basicGaugesY = this.basicGaugesY(rect);
        this.placeTimeGauge(actor, nameX, nameY);
        this.placeActorName(actor, nameX, nameY);
        this.placeStateIcon(actor, stateIconX, stateIconY);
        this.placeBasicGauges(actor, basicGaugesX, basicGaugesY);
    }

    faceRect(index) {
        const rect = this.itemRect(index);
        rect.pad(-1);
        rect.height = this.nameY(rect) + this.gaugeLineHeight() / 2 - rect.y;
        return rect;
    }

    nameX(rect) {
        return rect.x;
    }

    nameY(rect) {
        return this.basicGaugesY(rect) - this.gaugeLineHeight();
    }

    stateIconX(rect) {
        return rect.x + rect.width - ImageManager.standardIconWidth / 2 + 4;
    }

    stateIconY(rect) {
        return rect.y + ImageManager.standardIconHeight / 2 + 4;
    }

    basicGaugesX(rect) {
        return rect.x;
    }

    basicGaugesY(rect) {
        const bottom = rect.y + rect.height - this.extraHeight();
        const numGauges = DataManager.$dataSystem.optDisplayTp ? 3 : 2;
        return bottom - this.gaugeLineHeight() * numGauges;
    }
}

// Scene_ItemBase
//
// The superclass of Scene_Item and Scene_Skill.

import { Graphics, Rectangle } from '../core/index.js';

import { DataManager, SceneManager, SoundManager } from '../managers/index.js';
import { Game_Action } from '../objects/index.js';
import { Scene_Map, Scene_MenuBase } from '../scenes/index.js';
import { Window_MenuActor } from '../windows/index.js';

export class Scene_ItemBase extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
    }

    createActorWindow() {
        const rect = this.actorWindowRect();
        this._actorWindow = new Window_MenuActor(rect);
        this._actorWindow.setHandler("ok", this.onActorOk.bind(this));
        this._actorWindow.setHandler("cancel", this.onActorCancel.bind(this));
        this.addWindow(this._actorWindow);
    }

    actorWindowRect() {
        const wx = 0;
        const wy = Math.min(this.mainAreaTop(), this.helpAreaTop());
        const ww = Graphics.boxWidth - this.mainCommandWidth();
        const wh = this.mainAreaHeight() + this.helpAreaHeight();
        return new Rectangle(wx, wy, ww, wh);
    }

    item() {
        return this._itemWindow.item();
    }

    user() {
        return null;
    }

    isCursorLeft() {
        return this._itemWindow.index() % 2 === 0;
    }

    showActorWindow() {
        if (this.isCursorLeft()) {
            this._actorWindow.x = Graphics.boxWidth - this._actorWindow.width;
        } else {
            this._actorWindow.x = 0;
        }
        this._actorWindow.show();
        this._actorWindow.activate();
    }

    hideActorWindow() {
        this._actorWindow.hide();
        this._actorWindow.deactivate();
    }

    isActorWindowActive() {
        return this._actorWindow && this._actorWindow.active;
    }

    onActorOk() {
        if (this.canUse()) {
            this.useItem();
        } else {
            SoundManager.playBuzzer();
        }
    }

    onActorCancel() {
        this.hideActorWindow();
        this.activateItemWindow();
    }

    determineItem() {
        const action = new Game_Action(this.user());
        const item = this.item();
        action.setItemObject(item);
        if (action.isForFriend()) {
            this.showActorWindow();
            this._actorWindow.selectForItem(this.item());
        } else {
            this.useItem();
            this.activateItemWindow();
        }
    }

    useItem() {
        this.playSeForItem();
        this.user().useItem(this.item());
        this.applyItem();
        this.checkCommonEvent();
        this.checkGameover();
        this._actorWindow.refresh();
    }

    activateItemWindow() {
        this._itemWindow.refresh();
        this._itemWindow.activate();
    }

    itemTargetActors() {
        const action = new Game_Action(this.user());
        action.setItemObject(this.item());
        if (!action.isForFriend()) {
            return [];
        } else if (action.isForAll()) {
            return DataManager.$gameParty.members();
        } else {
            return [DataManager.$gameParty.members()[this._actorWindow.index()]];
        }
    }

    canUse() {
        const user = this.user();
        return user && user.canUse(this.item()) && this.isItemEffectsValid();
    }

    isItemEffectsValid() {
        const action = new Game_Action(this.user());
        action.setItemObject(this.item());
        return this.itemTargetActors().some((target) => action.testApply(target));
    }

    applyItem() {
        const action = new Game_Action(this.user());
        action.setItemObject(this.item());
        for (const target of this.itemTargetActors()) {
            for (let i = 0; i < action.numRepeats(); i++) {
                action.apply(target);
            }
        }
        action.applyGlobal();
    }

    checkCommonEvent() {
        if (DataManager.$gameTemp.isCommonEventReserved()) {
            SceneManager.goto(Scene_Map);
        }
    }
}

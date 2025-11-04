// Scene_Status
//
// The scene class of the status screen.

import { Graphics } from 'src/core/Graphics.js';
import { Rectangle } from 'src/core/Rectangle.js';

import { Window_Help } from 'src/windows/Window_Help.js';
import { Window_Status } from 'src/windows/Window_Status.js';
import { Window_StatusEquip } from 'src/windows/Window_StatusEquip.js';
import { Window_StatusParams } from 'src/windows/Window_StatusParams.js';

import { Scene_MenuBase } from './Scene_MenuBase.js';

export class Scene_Status extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createProfileWindow();
        this.createStatusWindow();
        this.createStatusParamsWindow();
        this.createStatusEquipWindow();
    }

    helpAreaHeight() {
        return 0;
    }

    createProfileWindow() {
        const rect = this.profileWindowRect();
        this._profileWindow = new Window_Help(rect);
        this.addWindow(this._profileWindow);
    }

    profileWindowRect() {
        const ww = Graphics.boxWidth;
        const wh = this.profileHeight();
        const wx = 0;
        const wy = this.mainAreaBottom() - wh;
        return new Rectangle(wx, wy, ww, wh);
    }

    createStatusWindow() {
        const rect = this.statusWindowRect();
        this._statusWindow = new Window_Status(rect);
        this._statusWindow.setHandler("cancel", this.popScene.bind(this));
        this._statusWindow.setHandler("pagedown", this.nextActor.bind(this));
        this._statusWindow.setHandler("pageup", this.previousActor.bind(this));
        this.addWindow(this._statusWindow);
    }

    statusWindowRect() {
        const wx = 0;
        const wy = this.mainAreaTop();
        const ww = Graphics.boxWidth;
        const wh = this.statusParamsWindowRect().y - wy;
        return new Rectangle(wx, wy, ww, wh);
    }

    createStatusParamsWindow() {
        const rect = this.statusParamsWindowRect();
        this._statusParamsWindow = new Window_StatusParams(rect);
        this.addWindow(this._statusParamsWindow);
    }

    statusParamsWindowRect() {
        const ww = this.statusParamsWidth();
        const wh = this.statusParamsHeight();
        const wx = 0;
        const wy = this.mainAreaBottom() - this.profileHeight() - wh;
        return new Rectangle(wx, wy, ww, wh);
    }

    createStatusEquipWindow() {
        const rect = this.statusEquipWindowRect();
        this._statusEquipWindow = new Window_StatusEquip(rect);
        this.addWindow(this._statusEquipWindow);
    }

    statusEquipWindowRect() {
        const ww = Graphics.boxWidth - this.statusParamsWidth();
        const wh = this.statusParamsHeight();
        const wx = this.statusParamsWidth();
        const wy = this.mainAreaBottom() - this.profileHeight() - wh;
        return new Rectangle(wx, wy, ww, wh);
    }

    statusParamsWidth() {
        return 300;
    }

    statusParamsHeight() {
        return this.calcWindowHeight(6, false);
    }

    profileHeight() {
        return this.calcWindowHeight(2, false);
    }

    start() {
        super.start();
        this.refreshActor();
    }

    needsPageButtons() {
        return true;
    }

    refreshActor() {
        const actor = this.actor();
        this._profileWindow.setText(actor.profile());
        this._statusWindow.setActor(actor);
        this._statusParamsWindow.setActor(actor);
        this._statusEquipWindow.setActor(actor);
    }

    onActorChange() {
        super.onActorChange();
        this.refreshActor();
        this._statusWindow.activate();
    }
}

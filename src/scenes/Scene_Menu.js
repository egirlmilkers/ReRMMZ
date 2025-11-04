// Scene_Menu
//
// The scene class of the menu screen.

import { Graphics } from 'src/core/Graphics.js';
import { Rectangle } from 'src/core/Rectangle.js';

import { DataManager } from "src/managers/DataManager";
import { SceneManager } from "src/managers/SceneManager";

import { Window_Gold } from "src/windows/Window_Gold";
import { Window_MenuCommand } from "src/windows/Window_MenuCommand";
import { Window_MenuStatus } from "src/windows/Window_MenuStatus";

import { Scene_Equip } from "./Scene_Equip";
import { Scene_GameEnd } from "./Scene_GameEnd";
import { Scene_Item } from "./Scene_Item";
import { Scene_MenuBase } from "./Scene_MenuBase";
import { Scene_Options } from "./Scene_Options";
import { Scene_Save } from "./Scene_Save";
import { Scene_Skill } from "./Scene_Skill";
import { Scene_Status } from "./Scene_Status";



export class Scene_Menu extends Scene_MenuBase {
    constructor() {
        super();
    }

    helpAreaHeight() {
        return 0;
    }

    create() {
        super.create();
        this.createCommandWindow();
        this.createGoldWindow();
        this.createStatusWindow();
    }

    start() {
        super.start();
        this._statusWindow.refresh();
    }

    createCommandWindow() {
        const rect = this.commandWindowRect();
        const commandWindow = new Window_MenuCommand(rect);
        commandWindow.setHandler("item", this.commandItem.bind(this));
        commandWindow.setHandler("skill", this.commandPersonal.bind(this));
        commandWindow.setHandler("equip", this.commandPersonal.bind(this));
        commandWindow.setHandler("status", this.commandPersonal.bind(this));
        commandWindow.setHandler("formation", this.commandFormation.bind(this));
        commandWindow.setHandler("options", this.commandOptions.bind(this));
        commandWindow.setHandler("save", this.commandSave.bind(this));
        commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
        commandWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(commandWindow);
        this._commandWindow = commandWindow;
    }

    commandWindowRect() {
        const ww = this.mainCommandWidth();
        const wh = this.mainAreaHeight() - this.goldWindowRect().height;
        const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
        const wy = this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    }

    createGoldWindow() {
        const rect = this.goldWindowRect();
        this._goldWindow = new Window_Gold(rect);
        this.addWindow(this._goldWindow);
    }

    goldWindowRect() {
        const ww = this.mainCommandWidth();
        const wh = this.calcWindowHeight(1, true);
        const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
        const wy = this.mainAreaBottom() - wh;
        return new Rectangle(wx, wy, ww, wh);
    }

    createStatusWindow() {
        const rect = this.statusWindowRect();
        this._statusWindow = new Window_MenuStatus(rect);
        this.addWindow(this._statusWindow);
    }

    statusWindowRect() {
        const ww = Graphics.boxWidth - this.mainCommandWidth();
        const wh = this.mainAreaHeight();
        const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
        const wy = this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    }

    commandItem() {
        SceneManager.push(Scene_Item);
    }

    commandPersonal() {
        this._statusWindow.setFormationMode(false);
        this._statusWindow.selectLast();
        this._statusWindow.activate();
        this._statusWindow.setHandler("ok", this.onPersonalOk.bind(this));
        this._statusWindow.setHandler("cancel", this.onPersonalCancel.bind(this));
    }

    commandFormation() {
        this._statusWindow.setFormationMode(true);
        this._statusWindow.selectLast();
        this._statusWindow.activate();
        this._statusWindow.setHandler("ok", this.onFormationOk.bind(this));
        this._statusWindow.setHandler("cancel", this.onFormationCancel.bind(this));
    }

    commandOptions() {
        SceneManager.push(Scene_Options);
    }

    commandSave() {
        SceneManager.push(Scene_Save);
    }

    commandGameEnd() {
        SceneManager.push(Scene_GameEnd);
    }

    onPersonalOk() {
        switch (this._commandWindow.currentSymbol()) {
            case "skill":
                SceneManager.push(Scene_Skill);
                break;
            case "equip":
                SceneManager.push(Scene_Equip);
                break;
            case "status":
                SceneManager.push(Scene_Status);
                break;
        }
    }

    onPersonalCancel() {
        this._statusWindow.deselect();
        this._commandWindow.activate();
    }

    onFormationOk() {
        const index = this._statusWindow.index();
        const pendingIndex = this._statusWindow.pendingIndex();
        if (pendingIndex >= 0) {
            DataManager.$gameParty.swapOrder(index, pendingIndex);
            this._statusWindow.setPendingIndex(-1);
            this._statusWindow.redrawItem(index);
        } else {
            this._statusWindow.setPendingIndex(index);
        }
        this._statusWindow.activate();
    }

    onFormationCancel() {
        if (this._statusWindow.pendingIndex() >= 0) {
            this._statusWindow.setPendingIndex(-1);
            this._statusWindow.activate();
        } else {
            this._statusWindow.deselect();
            this._commandWindow.activate();
        }
    }
}

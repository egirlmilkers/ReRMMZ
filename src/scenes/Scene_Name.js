// Scene_Name
//
// The scene class of the name input screen.


import { Graphics } from 'src/core/Graphics.js';
import { Rectangle } from 'src/core/Rectangle.js';

import { DataManager } from 'src/managers/DataManager.js';
import { ImageManager } from 'src/managers/ImageManager.js';

import { Window_NameEdit } from 'src/windows/Window_NameEdit.js';
import { Window_NameInput } from 'src/windows/Window_NameInput.js';

import { Scene_MenuBase } from './Scene_MenuBase.js';

export class Scene_Name extends Scene_MenuBase {
    constructor() {
        super();
    }

    prepare(actorId, maxLength) {
        this._actorId = actorId;
        this._maxLength = maxLength;
    }

    create() {
        super.create();
        this._actor = DataManager.$gameActors.actor(this._actorId);
        this.createEditWindow();
        this.createInputWindow();
    }

    start() {
        super.start();
        this._editWindow.refresh();
    }

    createEditWindow() {
        const rect = this.editWindowRect();
        this._editWindow = new Window_NameEdit(rect);
        this._editWindow.setup(this._actor, this._maxLength);
        this.addWindow(this._editWindow);
    }

    editWindowRect() {
        const inputWindowHeight = this.calcWindowHeight(9, true);
        const padding = DataManager.$gameSystem.windowPadding();
        const ww = 600;
        const wh = ImageManager.standardFaceHeight + padding * 2;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
        return new Rectangle(wx, wy, ww, wh);
    }

    createInputWindow() {
        const rect = this.inputWindowRect();
        this._inputWindow = new Window_NameInput(rect);
        this._inputWindow.setEditWindow(this._editWindow);
        this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
        this.addWindow(this._inputWindow);
    }

    inputWindowRect() {
        const wx = this._editWindow.x;
        const wy = this._editWindow.y + this._editWindow.height + 8;
        const ww = this._editWindow.width;
        const wh = this.calcWindowHeight(9, true);
        return new Rectangle(wx, wy, ww, wh);
    }

    onInputOk() {
        this._actor.setName(this._editWindow.name());
        this.popScene();
    }
}

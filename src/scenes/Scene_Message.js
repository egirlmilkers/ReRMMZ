// Scene_Message
//
// The superclass of Scene_Map and Scene_Battle.

import { Graphics } from 'src/core/Graphics.js';
import { Rectangle } from 'src/core/Rectangle.js';

import { Window_ChoiceList } from 'src/windows/Window_ChoiceList.js';
import { Window_EventItem } from 'src/windows/Window_EventItem.js';
import { Window_Gold } from 'src/windows/Window_Gold.js';
import { Window_Message } from 'src/windows/Window_Message.js';
import { Window_NameBox } from 'src/windows/Window_NameBox.js';
import { Window_NumberInput } from 'src/windows/Window_NumberInput.js';
import { Window_ScrollText } from 'src/windows/Window_ScrollText.js';

import { Scene_Base } from './Scene_Base.js';

export class Scene_Message extends Scene_Base {
    constructor() {
        super();
    }

    isMessageWindowClosing() {
        return this._messageWindow.isClosing();
    }

    createAllWindows() {
        this.createMessageWindow();
        this.createScrollTextWindow();
        this.createGoldWindow();
        this.createNameBoxWindow();
        this.createChoiceListWindow();
        this.createNumberInputWindow();
        this.createEventItemWindow();
        this.associateWindows();
    }

    createMessageWindow() {
        const rect = this.messageWindowRect();
        this._messageWindow = new Window_Message(rect);
        this.addWindow(this._messageWindow);
    }

    messageWindowRect() {
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(4, false) + 8;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    }

    createScrollTextWindow() {
        const rect = this.scrollTextWindowRect();
        this._scrollTextWindow = new Window_ScrollText(rect);
        this.addWindow(this._scrollTextWindow);
    }

    scrollTextWindowRect() {
        const wx = 0;
        const wy = 0;
        const ww = Graphics.boxWidth;
        const wh = Graphics.boxHeight;
        return new Rectangle(wx, wy, ww, wh);
    }

    createGoldWindow() {
        const rect = this.goldWindowRect();
        this._goldWindow = new Window_Gold(rect);
        this._goldWindow.openness = 0;
        this.addWindow(this._goldWindow);
    }

    goldWindowRect() {
        const ww = this.mainCommandWidth();
        const wh = this.calcWindowHeight(1, true);
        const wx = Graphics.boxWidth - ww;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    }

    createNameBoxWindow() {
        this._nameBoxWindow = new Window_NameBox();
        this.addWindow(this._nameBoxWindow);
    }

    createChoiceListWindow() {
        this._choiceListWindow = new Window_ChoiceList();
        this.addWindow(this._choiceListWindow);
    }

    createNumberInputWindow() {
        this._numberInputWindow = new Window_NumberInput();
        this.addWindow(this._numberInputWindow);
    }

    createEventItemWindow() {
        const rect = this.eventItemWindowRect();
        this._eventItemWindow = new Window_EventItem(rect);
        this.addWindow(this._eventItemWindow);
    }

    eventItemWindowRect() {
        const wx = 0;
        const wy = 0;
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(4, true);
        return new Rectangle(wx, wy, ww, wh);
    }

    associateWindows() {
        const messageWindow = this._messageWindow;
        messageWindow.setGoldWindow(this._goldWindow);
        messageWindow.setNameBoxWindow(this._nameBoxWindow);
        messageWindow.setChoiceListWindow(this._choiceListWindow);
        messageWindow.setNumberInputWindow(this._numberInputWindow);
        messageWindow.setEventItemWindow(this._eventItemWindow);
        this._nameBoxWindow.setMessageWindow(messageWindow);
        this._choiceListWindow.setMessageWindow(messageWindow);
        this._numberInputWindow.setMessageWindow(messageWindow);
        this._eventItemWindow.setMessageWindow(messageWindow);
    }

    cancelMessageWait() {
        this._messageWindow.cancelWait();
    }
}

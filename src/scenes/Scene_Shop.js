
// Scene_Shop
//
// The scene class of the shop screen.


import { Graphics } from 'src/core/Graphics.js';
import { Rectangle } from 'src/core/Rectangle.js';

import { DataManager } from 'src/managers/DataManager.js';
import { SoundManager } from 'src/managers/SoundManager.js';

import { Window_Base } from 'src/windows/Window_Base.js';
import { Window_Gold } from 'src/windows/Window_Gold.js';
import { Window_ItemCategory } from 'src/windows/Window_ItemCategory.js';
import { Window_ShopBuy } from 'src/windows/Window_ShopBuy.js';
import { Window_ShopCommand } from 'src/windows/Window_ShopCommand.js';
import { Window_ShopNumber } from 'src/windows/Window_ShopNumber.js';
import { Window_ShopSell } from 'src/windows/Window_ShopSell.js';
import { Window_ShopStatus } from 'src/windows/Window_ShopStatus.js';

import { Scene_MenuBase } from './Scene_MenuBase.js';

export class Scene_Shop extends Scene_MenuBase {
    constructor() {
        super();
    }

    prepare(goods, purchaseOnly) {
        this._goods = goods;
        this._purchaseOnly = purchaseOnly;
        this._item = null;
    }

    create() {
        super.create();
        this.createHelpWindow();
        this.createGoldWindow();
        this.createCommandWindow();
        this.createDummyWindow();
        this.createNumberWindow();
        this.createStatusWindow();
        this.createBuyWindow();
        this.createCategoryWindow();
        this.createSellWindow();
    }

    createGoldWindow() {
        const rect = this.goldWindowRect();
        this._goldWindow = new Window_Gold(rect);
        this.addWindow(this._goldWindow);
    }

    goldWindowRect() {
        const ww = this.mainCommandWidth();
        const wh = this.calcWindowHeight(1, true);
        const wx = Graphics.boxWidth - ww;
        const wy = this.mainAreaTop();
        return new Rectangle(wx, wy, ww, wh);
    }

    createCommandWindow() {
        const rect = this.commandWindowRect();
        this._commandWindow = new Window_ShopCommand(rect);
        this._commandWindow.setPurchaseOnly(this._purchaseOnly);
        this._commandWindow.y = this.mainAreaTop();
        this._commandWindow.setHandler("buy", this.commandBuy.bind(this));
        this._commandWindow.setHandler("sell", this.commandSell.bind(this));
        this._commandWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    }

    commandWindowRect() {
        const wx = 0;
        const wy = this.mainAreaTop();
        const ww = this._goldWindow.x;
        const wh = this.calcWindowHeight(1, true);
        return new Rectangle(wx, wy, ww, wh);
    }

    createDummyWindow() {
        const rect = this.dummyWindowRect();
        this._dummyWindow = new Window_Base(rect);
        this.addWindow(this._dummyWindow);
    }

    dummyWindowRect() {
        const wx = 0;
        const wy = this._commandWindow.y + this._commandWindow.height;
        const ww = Graphics.boxWidth;
        const wh = this.mainAreaHeight() - this._commandWindow.height;
        return new Rectangle(wx, wy, ww, wh);
    }

    createNumberWindow() {
        const rect = this.numberWindowRect();
        this._numberWindow = new Window_ShopNumber(rect);
        this._numberWindow.hide();
        this._numberWindow.setHandler("ok", this.onNumberOk.bind(this));
        this._numberWindow.setHandler("cancel", this.onNumberCancel.bind(this));
        this.addWindow(this._numberWindow);
    }

    numberWindowRect() {
        const wx = 0;
        const wy = this._dummyWindow.y;
        const ww = Graphics.boxWidth - this.statusWidth();
        const wh = this._dummyWindow.height;
        return new Rectangle(wx, wy, ww, wh);
    }

    createStatusWindow() {
        const rect = this.statusWindowRect();
        this._statusWindow = new Window_ShopStatus(rect);
        this._statusWindow.hide();
        this.addWindow(this._statusWindow);
    }

    statusWindowRect() {
        const ww = this.statusWidth();
        const wh = this._dummyWindow.height;
        const wx = Graphics.boxWidth - ww;
        const wy = this._dummyWindow.y;
        return new Rectangle(wx, wy, ww, wh);
    }

    createBuyWindow() {
        const rect = this.buyWindowRect();
        this._buyWindow = new Window_ShopBuy(rect);
        this._buyWindow.setupGoods(this._goods);
        this._buyWindow.setHelpWindow(this._helpWindow);
        this._buyWindow.setStatusWindow(this._statusWindow);
        this._buyWindow.hide();
        this._buyWindow.setHandler("ok", this.onBuyOk.bind(this));
        this._buyWindow.setHandler("cancel", this.onBuyCancel.bind(this));
        this.addWindow(this._buyWindow);
    }

    buyWindowRect() {
        const wx = 0;
        const wy = this._dummyWindow.y;
        const ww = Graphics.boxWidth - this.statusWidth();
        const wh = this._dummyWindow.height;
        return new Rectangle(wx, wy, ww, wh);
    }

    createCategoryWindow() {
        const rect = this.categoryWindowRect();
        this._categoryWindow = new Window_ItemCategory(rect);
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.hide();
        this._categoryWindow.deactivate();
        this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler("cancel", this.onCategoryCancel.bind(this));
        this.addWindow(this._categoryWindow);
    }

    categoryWindowRect() {
        const wx = 0;
        const wy = this._dummyWindow.y;
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(1, true);
        return new Rectangle(wx, wy, ww, wh);
    }

    createSellWindow() {
        const rect = this.sellWindowRect();
        this._sellWindow = new Window_ShopSell(rect);
        this._sellWindow.setHelpWindow(this._helpWindow);
        this._sellWindow.hide();
        this._sellWindow.setHandler("ok", this.onSellOk.bind(this));
        this._sellWindow.setHandler("cancel", this.onSellCancel.bind(this));
        this._categoryWindow.setItemWindow(this._sellWindow);
        this.addWindow(this._sellWindow);
        if (!this._categoryWindow.needsSelection()) {
            this._sellWindow.y -= this._categoryWindow.height;
            this._sellWindow.height += this._categoryWindow.height;
        }
    }

    sellWindowRect() {
        const wx = 0;
        const wy = this._categoryWindow.y + this._categoryWindow.height;
        const ww = Graphics.boxWidth;
        const wh = this.mainAreaHeight() - this._commandWindow.height - this._categoryWindow.height;
        return new Rectangle(wx, wy, ww, wh);
    }

    statusWidth() {
        return 352;
    }

    activateBuyWindow() {
        this._buyWindow.setMoney(this.money());
        this._buyWindow.show();
        this._buyWindow.activate();
        this._statusWindow.show();
    }

    activateSellWindow() {
        if (this._categoryWindow.needsSelection()) {
            this._categoryWindow.show();
        }
        this._sellWindow.refresh();
        this._sellWindow.show();
        this._sellWindow.activate();
        this._statusWindow.hide();
    }

    commandBuy() {
        this._dummyWindow.hide();
        this.activateBuyWindow();
    }

    commandSell() {
        this._dummyWindow.hide();
        this._sellWindow.show();
        this._sellWindow.deselect();
        this._sellWindow.refresh();
        if (this._categoryWindow.needsSelection()) {
            this._categoryWindow.show();
            this._categoryWindow.activate();
        } else {
            this.onCategoryOk();
        }
    }

    onBuyOk() {
        this._item = this._buyWindow.item();
        this._buyWindow.hide();
        this._numberWindow.setup(this._item, this.maxBuy(), this.buyingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
    }

    onBuyCancel() {
        this._commandWindow.activate();
        this._dummyWindow.show();
        this._buyWindow.hide();
        this._statusWindow.hide();
        this._statusWindow.setItem(null);
        this._helpWindow.clear();
    }

    onCategoryOk() {
        this.activateSellWindow();
        this._sellWindow.select(0);
    }

    onCategoryCancel() {
        this._commandWindow.activate();
        this._dummyWindow.show();
        this._categoryWindow.hide();
        this._sellWindow.hide();
    }

    onSellOk() {
        this._item = this._sellWindow.item();
        this._categoryWindow.hide();
        this._sellWindow.hide();
        this._numberWindow.setup(this._item, this.maxSell(), this.sellingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
        this._statusWindow.setItem(this._item);
        this._statusWindow.show();
    }

    onSellCancel() {
        this._sellWindow.deselect();
        this._statusWindow.setItem(null);
        this._helpWindow.clear();
        if (this._categoryWindow.needsSelection()) {
            this._categoryWindow.activate();
        } else {
            this.onCategoryCancel();
        }
    }

    onNumberOk() {
        SoundManager.playShop();
        switch (this._commandWindow.currentSymbol()) {
            case "buy":
                this.doBuy(this._numberWindow.number());
                break;
            case "sell":
                this.doSell(this._numberWindow.number());
                break;
        }
        this.endNumberInput();
        this._goldWindow.refresh();
        this._statusWindow.refresh();
    }

    onNumberCancel() {
        SoundManager.playCancel();
        this.endNumberInput();
    }

    doBuy(number) {
        DataManager.$gameParty.loseGold(number * this.buyingPrice());
        DataManager.$gameParty.gainItem(this._item, number);
    }

    doSell(number) {
        DataManager.$gameParty.gainGold(number * this.sellingPrice());
        DataManager.$gameParty.loseItem(this._item, number);
    }

    endNumberInput() {
        this._numberWindow.hide();
        switch (this._commandWindow.currentSymbol()) {
            case "buy":
                this.activateBuyWindow();
                break;
            case "sell":
                this.activateSellWindow();
                break;
        }
    }

    maxBuy() {
        const num = DataManager.$gameParty.numItems(this._item);
        const max = DataManager.$gameParty.maxItems(this._item) - num;
        const price = this.buyingPrice();
        if (price > 0) {
            return Math.min(max, Math.floor(this.money() / price));
        } else {
            return max;
        }
    }

    maxSell() {
        return DataManager.$gameParty.numItems(this._item);
    }

    money() {
        return this._goldWindow.value();
    }

    currencyUnit() {
        return this._goldWindow.currencyUnit();
    }

    buyingPrice() {
        return this._buyWindow.price(this._item);
    }

    sellingPrice() {
        return Math.floor(this._item.price / 2);
    }
}

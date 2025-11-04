// Window_ChoiceList
//
// The window used for the event command [Show Choices].

import { Graphics } from "../core/Graphics";
import { Rectangle } from "../core/Rectangle";

import { ConfigManager } from "../managers/ConfigManager";
import { DataManager } from "../managers/DataManager";

import { Sprite_Button } from "../sprites/Sprite_Button";

import { Window_Command } from "./Window_Command";
import { Window_Selectable } from "./Window_Selectable";

export class Window_ChoiceList extends Window_Command {
	constructor() {
		super(new Rectangle());
		this.createCancelButton();
		this.openness = 0;
		this.deactivate();
		this._background = 0;
		this._canRepeat = false;
	}

	setMessageWindow(messageWindow) {
		this._messageWindow = messageWindow;
	}

	createCancelButton() {
		if (ConfigManager.touchUI) {
			this._cancelButton = new Sprite_Button("cancel");
			this._cancelButton.visible = false;
			this.addChild(this._cancelButton);
		}
	}

	start() {
		this.updatePlacement();
		this.updateBackground();
		this.placeCancelButton();
		this.createContents();
		this.refresh();
		this.scrollTo(0, 0);
		this.selectDefault();
		this.open();
		this.activate();
	}

	update() {
		Window_Selectable.prototype.update.call(this);
		this.updateCancelButton();
	}

	updateCancelButton() {
		if (this._cancelButton) {
			this._cancelButton.visible =
				this.needsCancelButton() && this.isOpen();
		}
	}

	selectDefault() {
		this.select(DataManager.$gameMessage.choiceDefaultType());
	}

	updatePlacement() {
		this.x = this.windowX();
		this.y = this.windowY();
		this.width = this.windowWidth();
		this.height = this.windowHeight();
	}

	updateBackground() {
		this._background = DataManager.$gameMessage.choiceBackground();
		this.setBackgroundType(this._background);
	}

	placeCancelButton() {
		if (this._cancelButton) {
			const spacing = 8;
			const button = this._cancelButton;
			const right = this.x + this.width;
			if (right < Graphics.boxWidth - button.width + spacing) {
				button.x = this.width + spacing;
			} else {
				button.x = -button.width - spacing;
			}
			button.y = this.height / 2 - button.height / 2;
		}
	}

	windowX() {
		const positionType = DataManager.$gameMessage.choicePositionType();
		if (positionType === 1) {
			return (Graphics.boxWidth - this.windowWidth()) / 2;
		} else if (positionType === 2) {
			return Graphics.boxWidth - this.windowWidth();
		} else {
			return 0;
		}
	}

	windowY() {
		const messageY = this._messageWindow.y;
		if (messageY >= Graphics.boxHeight / 2) {
			return messageY - this.windowHeight();
		} else {
			return messageY + this._messageWindow.height;
		}
	}

	windowWidth() {
		const width =
			this.maxChoiceWidth() + this.colSpacing() + this.padding * 2;
		return Math.min(width, Graphics.boxWidth);
	}

	windowHeight() {
		return this.fittingHeight(this.numVisibleRows());
	}

	numVisibleRows() {
		const choices = DataManager.$gameMessage.choices();
		return Math.min(choices.length, this.maxLines());
	}

	maxLines() {
		const messageWindow = this._messageWindow;
		const messageY = messageWindow ? messageWindow.y : 0;
		const messageHeight = messageWindow ? messageWindow.height : 0;
		const centerY = Graphics.boxHeight / 2;
		if (messageY < centerY && messageY + messageHeight > centerY) {
			return 4;
		} else {
			return 8;
		}
	}

	maxChoiceWidth() {
		let maxWidth = 96;
		const choices = DataManager.$gameMessage.choices();
		for (const choice of choices) {
			const textWidth = this.textSizeEx(choice).width;
			const choiceWidth = Math.ceil(textWidth) + this.itemPadding() * 2;
			if (maxWidth < choiceWidth) {
				maxWidth = choiceWidth;
			}
		}
		return maxWidth;
	}

	makeCommandList() {
		const choices = DataManager.$gameMessage.choices();
		for (const choice of choices) {
			this.addCommand(choice, "choice");
		}
	}

	drawItem(index) {
		const rect = this.itemLineRect(index);
		this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width);
	}

	isCancelEnabled() {
		return DataManager.$gameMessage.choiceCancelType() !== -1;
	}

	needsCancelButton() {
		return DataManager.$gameMessage.choiceCancelType() === -2;
	}

	callOkHandler() {
		DataManager.$gameMessage.onChoice(this.index());
		this._messageWindow.terminateMessage();
		this.close();
	}

	callCancelHandler() {
		DataManager.$gameMessage.onChoice(
			DataManager.$gameMessage.choiceCancelType(),
		);
		this._messageWindow.terminateMessage();
		this.close();
	}
}

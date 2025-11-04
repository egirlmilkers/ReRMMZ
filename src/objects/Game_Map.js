// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

import { Graphics } from "../core/Graphics.js";

import { AudioManager } from "../managers/AudioManager.js";
import { DataManager } from "../managers/DataManager.js";
import { ImageManager } from "../managers/ImageManager.js";

import { Game_CommonEvent } from "./Game_CommonEvent.js";
import { Game_Event } from "./Game_Event.js";
import { Game_Interpreter } from "./Game_Interpreter.js";
import { Game_Vehicle } from "./Game_Vehicle.js";

export class Game_Map {
	constructor() {
		this._interpreter = new Game_Interpreter();
		this._mapId = 0;
		this._tilesetId = 0;
		this._events = [];
		this._commonEvents = [];
		this._vehicles = [];
		this._displayX = 0;
		this._displayY = 0;
		this._nameDisplay = true;
		this._scrollDirection = 2;
		this._scrollRest = 0;
		this._scrollSpeed = 4;
		this._parallaxName = "";
		this._parallaxZero = false;
		this._parallaxLoopX = false;
		this._parallaxLoopY = false;
		this._parallaxSx = 0;
		this._parallaxSy = 0;
		this._parallaxX = 0;
		this._parallaxY = 0;
		this._battleback1Name = null;
		this._battleback2Name = null;
		this.createVehicles();
	}

	setup(mapId) {
		if (!DataManager.$dataMap) {
			throw new Error("The map data is not available");
		}
		this._mapId = mapId;
		this._tilesetId = DataManager.$dataMap.tilesetId;
		this._displayX = 0;
		this._displayY = 0;
		this.refereshVehicles();
		this.setupEvents();
		this.setupScroll();
		this.setupParallax();
		this.setupBattleback();
		this._needsRefresh = false;
	}

	isEventRunning() {
		return this._interpreter.isRunning() || this.isAnyEventStarting();
	}

	tileWidth() {
		if ("tileSize" in DataManager.$dataSystem) {
			return DataManager.$dataSystem.tileSize;
		} else {
			return 48;
		}
	}

	tileHeight() {
		return this.tileWidth();
	}

	bushDepth() {
		return this.tileHeight() / 4;
	}

	mapId() {
		return this._mapId;
	}

	tilesetId() {
		return this._tilesetId;
	}

	displayX() {
		return this._displayX;
	}

	displayY() {
		return this._displayY;
	}

	parallaxName() {
		return this._parallaxName;
	}

	battleback1Name() {
		return this._battleback1Name;
	}

	battleback2Name() {
		return this._battleback2Name;
	}

	requestRefresh() {
		this._needsRefresh = true;
	}

	isNameDisplayEnabled() {
		return this._nameDisplay;
	}

	disableNameDisplay() {
		this._nameDisplay = false;
	}

	enableNameDisplay() {
		this._nameDisplay = true;
	}

	createVehicles() {
		this._vehicles = [];
		this._vehicles[0] = new Game_Vehicle("boat");
		this._vehicles[1] = new Game_Vehicle("ship");
		this._vehicles[2] = new Game_Vehicle("airship");
	}

	refereshVehicles() {
		for (const vehicle of this._vehicles) {
			vehicle.refresh();
		}
	}

	vehicles() {
		return this._vehicles;
	}

	vehicle(type) {
		if (type === 0 || type === "boat") {
			return this.boat();
		} else if (type === 1 || type === "ship") {
			return this.ship();
		} else if (type === 2 || type === "airship") {
			return this.airship();
		} else {
			return null;
		}
	}

	boat() {
		return this._vehicles[0];
	}

	ship() {
		return this._vehicles[1];
	}

	airship() {
		return this._vehicles[2];
	}

	setupEvents() {
		this._events = [];
		this._commonEvents = [];
		for (const event of DataManager.$dataMap.events.filter(
			(event) => !!event,
		)) {
			this._events[event.id] = new Game_Event(this._mapId, event.id);
		}
		for (const commonEvent of this.parallelCommonEvents()) {
			this._commonEvents.push(new Game_CommonEvent(commonEvent.id));
		}
		this.refreshTileEvents();
	}

	events() {
		return this._events.filter((event) => !!event);
	}

	event(eventId) {
		return this._events[eventId];
	}

	eraseEvent(eventId) {
		this._events[eventId].erase();
	}

	autorunCommonEvents() {
		return DataManager.$dataCommonEvents.filter(
			(commonEvent) => commonEvent && commonEvent.trigger === 1,
		);
	}

	parallelCommonEvents() {
		return DataManager.$dataCommonEvents.filter(
			(commonEvent) => commonEvent && commonEvent.trigger === 2,
		);
	}

	setupScroll() {
		this._scrollDirection = 2;
		this._scrollRest = 0;
		this._scrollSpeed = 4;
	}

	setupParallax() {
		this._parallaxName = DataManager.$dataMap.parallaxName || "";
		this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
		this._parallaxLoopX = DataManager.$dataMap.parallaxLoopX;
		this._parallaxLoopY = DataManager.$dataMap.parallaxLoopY;
		this._parallaxSx = DataManager.$dataMap.parallaxSx;
		this._parallaxSy = DataManager.$dataMap.parallaxSy;
		this._parallaxX = 0;
		this._parallaxY = 0;
	}

	setupBattleback() {
		if (DataManager.$dataMap.specifyBattleback) {
			this._battleback1Name = DataManager.$dataMap.battleback1Name;
			this._battleback2Name = DataManager.$dataMap.battleback2Name;
		} else {
			this._battleback1Name = null;
			this._battleback2Name = null;
		}
	}

	setDisplayPos(x, y) {
		if (this.isLoopHorizontal()) {
			this._displayX = x.mod(this.width());
			this._parallaxX = x;
		} else {
			const endX = this.width() - this.screenTileX();
			this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX);
			this._parallaxX = this._displayX;
		}
		if (this.isLoopVertical()) {
			this._displayY = y.mod(this.height());
			this._parallaxY = y;
		} else {
			const endY = this.height() - this.screenTileY();
			this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY);
			this._parallaxY = this._displayY;
		}
	}

	parallaxOx() {
		if (this._parallaxZero) {
			return this._parallaxX * this.tileWidth();
		} else if (this._parallaxLoopX) {
			return (this._parallaxX * this.tileWidth()) / 2;
		} else {
			return 0;
		}
	}

	parallaxOy() {
		if (this._parallaxZero) {
			return this._parallaxY * this.tileHeight();
		} else if (this._parallaxLoopY) {
			return (this._parallaxY * this.tileHeight()) / 2;
		} else {
			return 0;
		}
	}

	tileset() {
		return DataManager.$dataTilesets[this._tilesetId];
	}

	tilesetFlags() {
		const tileset = this.tileset();
		if (tileset) {
			return tileset.flags;
		} else {
			return [];
		}
	}

	displayName() {
		return DataManager.$dataMap.displayName;
	}

	width() {
		return DataManager.$dataMap.width;
	}

	height() {
		return DataManager.$dataMap.height;
	}

	data() {
		return DataManager.$dataMap.data;
	}

	isLoopHorizontal() {
		return (
			DataManager.$dataMap.scrollType === 2 ||
			DataManager.$dataMap.scrollType === 3
		);
	}

	isLoopVertical() {
		return (
			DataManager.$dataMap.scrollType === 1 ||
			DataManager.$dataMap.scrollType === 3
		);
	}

	isDashDisabled() {
		return DataManager.$dataMap.disableDashing;
	}

	encounterList() {
		return DataManager.$dataMap.encounterList;
	}

	encounterStep() {
		return DataManager.$dataMap.encounterStep;
	}

	isOverworld() {
		return this.tileset() && this.tileset().mode === 0;
	}

	screenTileX() {
		return Math.round((Graphics.width / this.tileWidth()) * 16) / 16;
	}

	screenTileY() {
		return Math.round((Graphics.height / this.tileHeight()) * 16) / 16;
	}

	adjustX(x) {
		if (
			this.isLoopHorizontal() &&
			x < this._displayX - (this.width() - this.screenTileX()) / 2
		) {
			return x - this._displayX + DataManager.$dataMap.width;
		} else {
			return x - this._displayX;
		}
	}

	adjustY(y) {
		if (
			this.isLoopVertical() &&
			y < this._displayY - (this.height() - this.screenTileY()) / 2
		) {
			return y - this._displayY + DataManager.$dataMap.height;
		} else {
			return y - this._displayY;
		}
	}

	roundX(x) {
		return this.isLoopHorizontal() ? x.mod(this.width()) : x;
	}

	roundY(y) {
		return this.isLoopVertical() ? y.mod(this.height()) : y;
	}

	xWithDirection(x, d) {
		return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
	}

	yWithDirection(y, d) {
		return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
	}

	roundXWithDirection(x, d) {
		return this.roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0));
	}

	roundYWithDirection(y, d) {
		return this.roundY(y + (d === 2 ? 1 : d === 8 ? -1 : 0));
	}

	deltaX(x1, x2) {
		let result = x1 - x2;
		if (this.isLoopHorizontal() && Math.abs(result) > this.width() / 2) {
			if (result < 0) {
				result += this.width();
			} else {
				result -= this.width();
			}
		}
		return result;
	}

	deltaY(y1, y2) {
		let result = y1 - y2;
		if (this.isLoopVertical() && Math.abs(result) > this.height() / 2) {
			if (result < 0) {
				result += this.height();
			} else {
				result -= this.height();
			}
		}
		return result;
	}

	distance(x1, y1, x2, y2) {
		return Math.abs(this.deltaX(x1, x2)) + Math.abs(this.deltaY(y1, y2));
	}

	canvasToMapX(x) {
		const tileWidth = this.tileWidth();
		const originX = this._displayX * tileWidth;
		const mapX = Math.floor((originX + x) / tileWidth);
		return this.roundX(mapX);
	}

	canvasToMapY(y) {
		const tileHeight = this.tileHeight();
		const originY = this._displayY * tileHeight;
		const mapY = Math.floor((originY + y) / tileHeight);
		return this.roundY(mapY);
	}

	autoplay() {
		if (DataManager.$dataMap.autoplayBgm) {
			if (DataManager.$gamePlayer.isInVehicle()) {
				DataManager.$gameSystem.saveWalkingBgm2();
			} else {
				AudioManager.playBgm(DataManager.$dataMap.bgm);
			}
		}
		if (DataManager.$dataMap.autoplayBgs) {
			AudioManager.playBgs(DataManager.$dataMap.bgs);
		}
	}

	refreshIfNeeded() {
		if (this._needsRefresh) {
			this.refresh();
		}
	}

	refresh() {
		for (const event of this.events()) {
			event.refresh();
		}
		for (const commonEvent of this._commonEvents) {
			commonEvent.refresh();
		}
		this.refreshTileEvents();
		this._needsRefresh = false;
	}

	refreshTileEvents() {
		this._tileEvents = this.events().filter((event) => event.isTile());
	}

	eventsXy(x, y) {
		return this.events().filter((event) => event.pos(x, y));
	}

	eventsXyNt(x, y) {
		return this.events().filter((event) => event.posNt(x, y));
	}

	tileEventsXy(x, y) {
		return this._tileEvents.filter((event) => event.posNt(x, y));
	}

	eventIdXy(x, y) {
		const list = this.eventsXy(x, y);
		return list.length === 0 ? 0 : list[0].eventId();
	}

	scrollDown(distance) {
		if (this.isLoopVertical()) {
			this._displayY += distance;
			this._displayY %= DataManager.$dataMap.height;
			if (this._parallaxLoopY) {
				this._parallaxY += distance;
			}
		} else if (this.height() >= this.screenTileY()) {
			const lastY = this._displayY;
			this._displayY = Math.min(
				this._displayY + distance,
				this.height() - this.screenTileY(),
			);
			this._parallaxY += this._displayY - lastY;
		}
	}

	scrollLeft(distance) {
		if (this.isLoopHorizontal()) {
			this._displayX += DataManager.$dataMap.width - distance;
			this._displayX %= DataManager.$dataMap.width;
			if (this._parallaxLoopX) {
				this._parallaxX -= distance;
			}
		} else if (this.width() >= this.screenTileX()) {
			const lastX = this._displayX;
			this._displayX = Math.max(this._displayX - distance, 0);
			this._parallaxX += this._displayX - lastX;
		}
	}

	scrollRight(distance) {
		if (this.isLoopHorizontal()) {
			this._displayX += distance;
			this._displayX %= DataManager.$dataMap.width;
			if (this._parallaxLoopX) {
				this._parallaxX += distance;
			}
		} else if (this.width() >= this.screenTileX()) {
			const lastX = this._displayX;
			this._displayX = Math.min(
				this._displayX + distance,
				this.width() - this.screenTileX(),
			);
			this._parallaxX += this._displayX - lastX;
		}
	}

	scrollUp(distance) {
		if (this.isLoopVertical()) {
			this._displayY += DataManager.$dataMap.height - distance;
			this._displayY %= DataManager.$dataMap.height;
			if (this._parallaxLoopY) {
				this._parallaxY -= distance;
			}
		} else if (this.height() >= this.screenTileY()) {
			const lastY = this._displayY;
			this._displayY = Math.max(this._displayY - distance, 0);
			this._parallaxY += this._displayY - lastY;
		}
	}

	isValid(x, y) {
		return x >= 0 && x < this.width() && y >= 0 && y < this.height();
	}

	checkPassage(x, y, bit) {
		const flags = this.tilesetFlags();
		const tiles = this.allTiles(x, y);
		for (const tile of tiles) {
			const flag = flags[tile];
			if ((flag & 0x10) !== 0) {
				// [*] No effect on passage
				continue;
			}
			if ((flag & bit) === 0) {
				// [o] Passable
				return true;
			}
			if ((flag & bit) === bit) {
				// [x] Impassable
				return false;
			}
		}
		return false;
	}

	tileId(x, y, z) {
		const width = DataManager.$dataMap.width;
		const height = DataManager.$dataMap.height;
		return DataManager.$dataMap.data[(z * height + y) * width + x] || 0;
	}

	layeredTiles(x, y) {
		const tiles = [];
		for (let i = 0; i < 4; i++) {
			tiles.push(this.tileId(x, y, 3 - i));
		}
		return tiles;
	}

	allTiles(x, y) {
		const tiles = this.tileEventsXy(x, y).map((event) => event.tileId());
		return tiles.concat(this.layeredTiles(x, y));
	}

	autotileType(x, y, z) {
		const tileId = this.tileId(x, y, z);
		return tileId >= 2048 ? Math.floor((tileId - 2048) / 48) : -1;
	}

	isPassable(x, y, d) {
		return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
	}

	isBoatPassable(x, y) {
		return this.checkPassage(x, y, 0x0200);
	}

	isShipPassable(x, y) {
		return this.checkPassage(x, y, 0x0400);
	}

	isAirshipLandOk(x, y) {
		return this.checkPassage(x, y, 0x0800) && this.checkPassage(x, y, 0x0f);
	}

	checkLayeredTilesFlags(x, y, bit) {
		const flags = this.tilesetFlags();
		return this.layeredTiles(x, y).some(
			(tileId) => (flags[tileId] & bit) !== 0,
		);
	}

	isLadder(x, y) {
		return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x20);
	}

	isBush(x, y) {
		return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x40);
	}

	isCounter(x, y) {
		return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x80);
	}

	isDamageFloor(x, y) {
		return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x100);
	}

	terrainTag(x, y) {
		if (this.isValid(x, y)) {
			const flags = this.tilesetFlags();
			const tiles = this.layeredTiles(x, y);
			for (const tile of tiles) {
				const tag = flags[tile] >> 12;
				if (tag > 0) {
					return tag;
				}
			}
		}
		return 0;
	}

	regionId(x, y) {
		return this.isValid(x, y) ? this.tileId(x, y, 5) : 0;
	}

	startScroll(direction, distance, speed) {
		this._scrollDirection = direction;
		this._scrollRest = distance;
		this._scrollSpeed = speed;
	}

	isScrolling() {
		return this._scrollRest > 0;
	}

	update(sceneActive) {
		this.refreshIfNeeded();
		if (sceneActive) {
			this.updateInterpreter();
		}
		this.updateScroll();
		this.updateEvents();
		this.updateVehicles();
		this.updateParallax();
	}

	updateScroll() {
		if (this.isScrolling()) {
			const lastX = this._displayX;
			const lastY = this._displayY;
			this.doScroll(this._scrollDirection, this.scrollDistance());
			if (this._displayX === lastX && this._displayY === lastY) {
				this._scrollRest = 0;
			} else {
				this._scrollRest -= this.scrollDistance();
			}
		}
	}

	scrollDistance() {
		return Math.pow(2, this._scrollSpeed) / 256;
	}

	doScroll(direction, distance) {
		switch (direction) {
			case 2:
				this.scrollDown(distance);
				break;
			case 4:
				this.scrollLeft(distance);
				break;
			case 6:
				this.scrollRight(distance);
				break;
			case 8:
				this.scrollUp(distance);
				break;
		}
	}

	updateEvents() {
		for (const event of this.events()) {
			event.update();
		}
		for (const commonEvent of this._commonEvents) {
			commonEvent.update();
		}
	}

	updateVehicles() {
		for (const vehicle of this._vehicles) {
			vehicle.update();
		}
	}

	updateParallax() {
		if (this._parallaxLoopX) {
			this._parallaxX += this._parallaxSx / this.tileWidth() / 2;
		}
		if (this._parallaxLoopY) {
			this._parallaxY += this._parallaxSy / this.tileHeight() / 2;
		}
	}

	changeTileset(tilesetId) {
		this._tilesetId = tilesetId;
		this.refresh();
	}

	changeBattleback(battleback1Name, battleback2Name) {
		this._battleback1Name = battleback1Name;
		this._battleback2Name = battleback2Name;
	}

	changeParallax(name, loopX, loopY, sx, sy) {
		this._parallaxName = name;
		this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
		if (this._parallaxLoopX && !loopX) {
			this._parallaxX = 0;
		}
		if (this._parallaxLoopY && !loopY) {
			this._parallaxY = 0;
		}
		this._parallaxLoopX = loopX;
		this._parallaxLoopY = loopY;
		this._parallaxSx = sx;
		this._parallaxSy = sy;
	}

	updateInterpreter() {
		for (;;) {
			this._interpreter.update();
			if (this._interpreter.isRunning()) {
				return;
			}
			if (this._interpreter.eventId() > 0) {
				this.unlockEvent(this._interpreter.eventId());
				this._interpreter.clear();
			}
			if (!this.setupStartingEvent()) {
				return;
			}
		}
	}

	unlockEvent(eventId) {
		if (this._events[eventId]) {
			this._events[eventId].unlock();
		}
	}

	setupStartingEvent() {
		this.refreshIfNeeded();
		if (this._interpreter.setupReservedCommonEvent()) {
			return true;
		}
		if (this.setupTestEvent()) {
			return true;
		}
		if (this.setupStartingMapEvent()) {
			return true;
		}
		if (this.setupAutorunCommonEvent()) {
			return true;
		}
		return false;
	}

	setupTestEvent() {
		if (DataManager.$testEvent) {
			this._interpreter.setup(DataManager.$testEvent, 0);
			DataManager.$testEvent = null;
			return true;
		}
		return false;
	}

	setupStartingMapEvent() {
		for (const event of this.events()) {
			if (event.isStarting()) {
				event.clearStartingFlag();
				this._interpreter.setup(event.list(), event.eventId());
				return true;
			}
		}
		return false;
	}

	setupAutorunCommonEvent() {
		for (const commonEvent of this.autorunCommonEvents()) {
			if (DataManager.$gameSwitches.value(commonEvent.switchId)) {
				this._interpreter.setup(commonEvent.list);
				return true;
			}
		}
		return false;
	}

	isAnyEventStarting() {
		return this.events().some((event) => event.isStarting());
	}
}

// Game_Actors
//
// The wrapper class for an actor array.

import { DataManager } from "../managers/DataManager.js";

import { Game_Actor } from "./Game_Actor.js";

export class Game_Actors {
	constructor() {
		this._data = [];
	}

	actor(actorId) {
		if (DataManager.$dataActors[actorId]) {
			if (!this._data[actorId]) {
				this._data[actorId] = new Game_Actor(actorId);
			}
			return this._data[actorId];
		}
		return null;
	}
}

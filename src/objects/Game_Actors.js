// Game_Actors
//
// The wrapper class for an actor array.

import { DataManager } from '../managers/index.js';
import { Game_Actor } from '../objects/index.js';

export function Game_Actors() {
	this._data = [];
};

Game_Actors.prototype.actor = function (actorId) {
	if (DataManager.$dataActors[actorId]) {
		if (!this._data[actorId]) {
			this._data[actorId] = new Game_Actor(actorId);
		}
		return this._data[actorId];
	}
	return null;
};

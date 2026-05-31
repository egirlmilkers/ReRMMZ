declare namespace RMMZ {
	interface Enemy extends DataObj {
		id: number;
		actions: Action[];
		battlerHue: number;
		battlerName: string;
		dropItems: DropItem[];
		exp: number;
		traits: Trait[];
		gold: number;
		name: string;
		params: [number, number, number, number, number, number, number, number];
	}
}

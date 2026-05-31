declare namespace RMMZ {
	interface Tileset extends DataObj {
		id: number;
		flags: number[];
		mode: number;
		name: string;
		tilesetNames: string[];
	}
}

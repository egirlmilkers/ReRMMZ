declare namespace RMMZ {
	interface Armor extends DataObj {
		id: number;
		atypeId: number;
		description: string;
		etypeId: number;
		traits: Trait[];
		iconIndex: number;
		name: string;
		params: [number, number, number, number, number, number, number, number];
		price: number;
	}
}
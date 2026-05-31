declare namespace RMMZ {
	interface Weapon extends DataObj {
		id: number;
		animationId: number;
		description: string;
		etypeId: number;
		traits: Trait[];
		iconIndex: number;
		name: string;
		params: number[];
		price: number;
		wtypeId: number;
	}
}

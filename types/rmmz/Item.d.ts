declare namespace RMMZ {
	interface Item extends DataObj {
		id: number;
		animationId: number;
		consumable: boolean;
		damage: Damage;
		description: string;
		effects: Effect[];
		hitType: number;
		iconIndex: number;
		itypeId: number;
		name: string;
		occasion: number;
		price: number;
		repeats: number;
		scope: number;
		speed: number;
		successRate: number;
		tpGain: number;
	}
}

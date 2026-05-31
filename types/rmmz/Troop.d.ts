declare namespace RMMZ {
	interface TroopConditions {
		actorHp: number;
		actorId: number;
		actorValid: boolean;
		enemyHp: number;
		enemyIndex: number;
		enemyValid: boolean;
		switchId: number;
		switchValid: boolean;
		turnA: number;
		turnB: number;
		turnEnding: boolean;
		turnValid: boolean;
	}

	interface TroopPage {
		conditions: TroopConditions;
		list: EventCommand[];
		span: number;
	}

	interface Troop {
		id: number;
		members: Member[];
		name: string;
		pages: TroopPage[];
	}
}

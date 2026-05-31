declare namespace RMMZ {
	interface EventConditions {
		actorId: number;
		actorValid: number;
		itemId: number;
		itemValid: number;
		selfSwitchCh: string;
		selfSwitchValid: boolean;
		switch1Id: number;
		switch1Valid: boolean;
		switch2Id: number;
		switch2Valid: boolean;
		variableId: number;
		variableValid: boolean;
		variableValue: number;
	}

	interface EventPage {
		conditions: EventConditions;
		directionFix: boolean;
		image: Image;
		list: EventCommand[];
		moveFrequency: number;
		moveRoute: MoveRoute;
		moveSpeed: number;
		moveType: number;
		priorityType: number;
		stepAnime: boolean;
		through: boolean;
		trigger: number;
		walkAnime: boolean;
	}

	interface Event extends DataObj {
		id: number;
		name: string;
		pages: EventPage[];
		x: number;
		y: number;
	}
}

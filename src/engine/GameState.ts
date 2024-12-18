export enum GameStateDefinition {
	LOADING = 'LOADING',
	INTRO = 'INTRO',
	NARRATION = 'NARRATION',
	MAP = 'MAP',
	LOCATION = 'LOCATION',
	DIALOGUE = 'DIALOGUE',
	COLLECTION = 'COLLECTION',
	HOUSE = 'HOUSE',
}

export class GameState {
	constructor (public state: GameStateDefinition) {}

	init () {
		console.log(`Game state is ${this.state}`)
	}
}

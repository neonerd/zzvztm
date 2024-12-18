import { GameState, GameStateDefinition } from './GameState';

export class Game {
	state: GameState

	constructor () {
		this.state = new GameState(GameStateDefinition.LOADING)
	}
}

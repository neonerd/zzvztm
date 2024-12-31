import { GameState, GameStateDefinition } from './GameState';
import { UI } from './UI';
import { World } from './World';

export class Game {
	state: GameState
	world: World
	ui: UI

	constructor () {
		this.state = new GameState(GameStateDefinition.LOADING)
		this.world = new World()
		this.ui = new UI()
	}
}

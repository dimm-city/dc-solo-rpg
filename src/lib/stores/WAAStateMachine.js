
export const transitions = {
	loadGame: {
		options: 'options'
	},
	options: {
		intro: 'intro'
	},
	intro: {
		rollForTasks: 'rollForTasks'
	},
	startRound: {
		rollForTasks: 'rollForTasks'
	},
	rollForTasks: {
		drawCard: 'drawCard'
	},
	drawCard: {
		failureCheck: 'failureCheck',
		drawCard: 'drawCard',
		endTurn: 'endTurn',
		log: 'log',
		gameOver: 'gameOver'
	},
	failureCheck: {
		drawCard: 'drawCard',
		endTurn: 'endTurn',
		log: 'log',
		gameOver: 'gameOver'
	},
	endTurn: {
		log: 'log'
	},
	log: {
		successCheck: 'successCheck',
		startRound: 'startRound'
	},
	successCheck: {
		startRound: 'startRound',
		gameOver: 'gameOver'
	},
	gameOver: {
		finalLog: 'finalLog',
		intro: 'intro'
	},
	finalLog: {
		exitGame: 'exitGame',
		intro: 'intro'
	},
	exitGame: {
		loadGame: 'loadGame',
		options: 'options'
	},
	errorScreen: {
		loadGame: 'loadGame'
	}
};

const defaultTransitions = transitions;
export class StateMachine {
	constructor(initialState, transitions) {
		this.state = initialState;
		this.transitions = transitions ?? defaultTransitions;
	}

	next(action) {
		const transition = this.transitions[this.state][action];

		if (transition || action == "exitGame" || action == "errorScreen") {
			this.state = transition ?? action;
			console.log('transition to:', action);
            return action; //this.state.toString();
		} else {
			throw new Error(`Invalid transition from ${this.state} on ${action}`);
		}
	}
}

// const stateMachine = new StateMachine('loadGame', transitions, {});
// stateMachine.next('start');

// Usage:
// game.next('start');
// console.log(game.state); // 'options'

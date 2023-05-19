export class StateMachine {
	constructor(initialState, transitions) {
		this.state = initialState;
		this.transitions = transitions;
	}

	next(action) {
		const transition = this.transitions[this.state][action];

		if (transition) {
			this.state = transition;
			console.log('transtion to:', action);
            return action; //this.state.toString();
		} else {
			throw new Error(`Invalid transition from ${this.state} on ${action}`);
		}
	}
}

export const transitions = {
	loadGame: {
		options: 'options'
	},
	options: {
		intro: 'intro'
	},
	intro: {
		startRound: 'startRound'
	},
	startRound: {
		rollForTasks: 'rollForTasks'
	},
	rollForTasks: {
		drawCard: 'drawCard'
	},
	drawCard: {
		pullFromTower: 'pullFromTower',
		drawCard: 'drawCard',
		endTurn: 'endTurn',
        gameOver: 'gameOver'
	},
	pullFromTower: {
		drawCard: 'drawCard',
		endTurn: 'endTurn',
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
    gameOver:{
        finalLog: "finalLog"
    },
    finalLog:{
        loadGame: "loadGame",
        intro: "intro"
    }
};

// const stateMachine = new StateMachine('loadGame', transitions, {});
// stateMachine.next('start');

// Usage:
// game.next('start');
// console.log(game.state); // 'options'

import { State } from './State.js';
import PrimaryFailureCheck from './Actions/PrimaryFailureCheck.js';
import SuccessCheck from './Actions/SuccessCheck.js';

const Phases = { Tasks: 0, Logging: 1 };

export class Game {
	constructor() {
		this.config = {};
		this.state = new State();
		this.taskSelector = null;
		this.PrimaryFailureCheck = PrimaryFailureCheck;
		this.SuccessCheck = SuccessCheck;
	}

	rollDice(max) {
		return Math.floor(Math.random() * (max - 2) + 1);
	}

	async startGame(config, currentState = null) {
		this.config = config;
		if (currentState)
		 this.state = new State(currentState);
		else {
			this.state.currentRound = 0;
			this.state.successCounter = 0;
			this.state.primaryFailureCounter = 100;
			this.state.secondaryFailureCounter = 0;
		}
		const TaskSelector = config.taskSelector
			? await import(config.taskSelector)
			: await import('./TaskSelector');
		this.taskSelector = new TaskSelector.default(this.config, this.state);

		console.debug('game started', this);
	}

	async beginRound() {
		this.state.currentRound++;
		this.state.currentPhase = Phases.Tasks;

		if (this.state.availableTasks.length === 0) {
			this.state.currentTasks = [];
		} else {
			this.state.currentTasks = await this.taskSelector.getTasksForRound();
		}

		if (this.state.successCounter === 10 || this.state.currentTasks.length === 0) {
			//Final roll before winning
			this.PrimaryFailureCheck(this.state);
		}

		for (let index = 0; index < this.state.currentTasks.length; index++) {
			const task = this.state.currentTasks[index];

			if (typeof task.action === 'string') {
				try {
					task.action = await import('./Actions/' + task.action);
				} catch (error) {
					console.error(error);
					try {
						task.action = await import(task.action);
					} catch (error) {
						console.error(error);
					}
				}
			}

			if (task.action != null) {
				if (typeof task.action === 'function') task.action(this.state);
				else if (typeof task.action === 'object' && typeof task.action.run === 'function')
					task.action.run(this.state);
			}

			task.roundCompleted = this.state.currentRound;
		}

		console.debug('round started', this);
	}

	endRound(journalEntry) {
		if (journalEntry == null || journalEntry.text == null) {
			throw new Error('No journal entries provided for this round');
		}

		journalEntry.round = this.state.currentRound;
		journalEntry.dateRecorded = journalEntry.dateRecorded || new Date().toISOString();

		this.state.journalEntries.push(journalEntry);
		this.SuccessCheck(this.state);
		this.state.completedTasks = [...this.state.completedTasks, ...this.state.currentTasks];
		this.currentTasks = [];
	}

	endGame() {}
}

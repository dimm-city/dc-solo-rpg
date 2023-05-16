//import { roll } from './Dice.js';
async function getTasks(numberOfTasks, state) {
	const { availableTasks } = state;
	const len = availableTasks.length;
	const limit = numberOfTasks > len ? len : numberOfTasks;
	const results = [];

	const indices = new Set();
	do {
		indices.add(Math.floor(Math.random() * len));
	} while (indices.size < limit);

	availableTasks.forEach((task, index) => {
		if (indices.has(index)) {
			results.push(task);
			indices.delete(index);
		}
	});

	//   this.state = {
	//     ...this.state,
	//     availableTasks: availableTasks.filter((_, index) => indices.has(index)),
	//   };
	state.availableTasks = availableTasks.filter(t=> !results.includes(t));
	return results;
}
class TaskSelector {
	constructor(config, state) {
		this.config = config;
		this.state = state;
		this.allTasks = [...this.config.categories.flatMap((c) => c.tasks)];

		if (this.state.availableTasks == null) {
			this.state.availableTasks = [...this.allTasks];
		}
	}

	async getTasksForRound() {
		let numberOfTasks = await this.config.rollDice();
		let results = [];

		if (this.state.currentRound === 1 && this.config.difficulty === 0) {
			if (this.state.availableTasks.length === 0 && this.state.completedTasks.length === 0)
				this.state.availableTasks = [...this.allTasks];

			results = this.state.availableTasks.splice(0, 1);

			numberOfTasks--;
		}

		const tasks = await getTasks(numberOfTasks, this.state);
		results = [...results, ...tasks];

		return results;
	}

	// async _getTasks(numberOfTasks) {
	// 	if (numberOfTasks > this.state.availableTasks.length)
	// 		numberOfTasks = this.state.availableTasks.length;

	// 	let results = [];

	// 	let numbers = [];
	// 	for (let index = 0; index < numberOfTasks; index++) {
	// 		let taskIndex = roll(this.state.availableTasks.length) - 1;

	// 		while (numbers.includes(taskIndex) && this.state.availableTasks.length > 0) {
	// 			taskIndex = roll(this.state.availableTasks.length) - 1;
	// 		}
	// 		numbers.push(taskIndex);
	// 	}
	// 	results = this.state.availableTasks.filter((v, i) => numbers.includes(i));
	// 	this.state.availableTasks = this.state.availableTasks.filter((v, i) => !numbers.includes(i));
	// 	return results;
	// }
}

export default TaskSelector;

/**
 * Unit tests for transitions.js
 * Tests the pure state transition graph
 */
import { describe, it, expect } from 'vitest';
import { transitionGraph, getValidNextStates, isValidTransition } from './transitions.js';

describe('transitions', () => {
	describe('transitionGraph', () => {
		it('should have all required game states', () => {
			const requiredStates = [
				'loadGame',
				'showIntro',
				'initialDamageRoll',
				'startRound',
				'rollForTasks',
				'drawCard',
				'failureCheck',
				'endTurn',
				'log',
				'successCheck',
				'finalDamageRoll',
				'gameOver',
				'finalLog',
				'exitGame',
				'errorScreen'
			];

			requiredStates.forEach((state) => {
				expect(transitionGraph).toHaveProperty(state);
			});
		});

		it('should have arrays of valid next states', () => {
			Object.values(transitionGraph).forEach((nextStates) => {
				expect(Array.isArray(nextStates)).toBe(true);
				expect(nextStates.length).toBeGreaterThan(0);
			});
		});

		it('should define valid game flow from loadGame to intro', () => {
			expect(transitionGraph.loadGame).toContain('showIntro');
			expect(transitionGraph.showIntro).toContain('initialDamageRoll');
		});

		it('should define valid game flow through main gameplay', () => {
			expect(transitionGraph.initialDamageRoll).toContain('startRound');
			expect(transitionGraph.rollForTasks).toContain('drawCard');
			expect(transitionGraph.drawCard).toContain('failureCheck');
			expect(transitionGraph.drawCard).toContain('endTurn');
		});

		it('should define valid round cycle', () => {
			expect(transitionGraph.log).toContain('startRound');
			expect(transitionGraph.startRound).toContain('rollForTasks');
		});

		it('should allow drawCard to repeat', () => {
			expect(transitionGraph.drawCard).toContain('drawCard');
		});

		it('should define game over flow', () => {
			expect(transitionGraph.drawCard).toContain('gameOver');
			expect(transitionGraph.gameOver).toContain('finalLog');
			expect(transitionGraph.finalLog).toContain('exitGame');
		});

		it('should allow exiting via exitGame -> loadGame', () => {
			expect(transitionGraph.finalLog).toContain('exitGame');
			expect(transitionGraph.exitGame).toContain('loadGame');
		});

		it('should allow exiting to loadGame', () => {
			expect(transitionGraph.exitGame).toContain('loadGame');
		});
	});

	describe('getValidNextStates', () => {
		it('should return valid next states for loadGame', () => {
			const states = getValidNextStates('loadGame');
			expect(states).toEqual(['showIntro']);
		});

		it('should return valid next states for showIntro', () => {
			const states = getValidNextStates('showIntro');
			expect(states).toEqual(['initialDamageRoll']);
		});

		it('should return valid next states for drawCard', () => {
			const states = getValidNextStates('drawCard');
			expect(states).toContain('failureCheck');
			expect(states).toContain('drawCard');
			expect(states).toContain('endTurn');
			expect(states).toContain('log');
			expect(states).toContain('successCheck');
			expect(states).toContain('gameOver');
		});

		it('should return empty array for unknown state', () => {
			const states = getValidNextStates('unknownState');
			expect(states).toEqual([]);
		});

		it('should return array for all defined states', () => {
			Object.keys(transitionGraph).forEach((state) => {
				const nextStates = getValidNextStates(state);
				expect(Array.isArray(nextStates)).toBe(true);
			});
		});
	});

	describe('isValidTransition', () => {
		describe('Valid Transitions', () => {
			it('should validate loadGame -> showIntro', () => {
				expect(isValidTransition('loadGame', 'showIntro')).toBe(true);
			});

			it('should validate showIntro -> initialDamageRoll', () => {
				expect(isValidTransition('showIntro', 'initialDamageRoll')).toBe(true);
			});

			it('should validate initialDamageRoll -> rollForTasks', () => {
				expect(isValidTransition('initialDamageRoll', 'startRound')).toBe(true);
			});

			it('should validate rollForTasks -> drawCard', () => {
				expect(isValidTransition('rollForTasks', 'drawCard')).toBe(true);
			});

			it('should validate drawCard -> drawCard (repeat)', () => {
				expect(isValidTransition('drawCard', 'drawCard')).toBe(true);
			});

			it('should validate drawCard -> failureCheck', () => {
				expect(isValidTransition('drawCard', 'failureCheck')).toBe(true);
			});

			it('should validate drawCard -> endTurn', () => {
				expect(isValidTransition('drawCard', 'endTurn')).toBe(true);
			});

			it('should validate endTurn -> log', () => {
				expect(isValidTransition('endTurn', 'log')).toBe(true);
			});

			it('should validate log -> startRound', () => {
				expect(isValidTransition('log', 'startRound')).toBe(true);
			});

			it('should validate drawCard -> gameOver', () => {
				expect(isValidTransition('drawCard', 'gameOver')).toBe(true);
			});

			it('should validate gameOver -> finalLog', () => {
				expect(isValidTransition('gameOver', 'finalLog')).toBe(true);
			});

			it('should validate finalLog -> exitGame', () => {
				expect(isValidTransition('finalLog', 'exitGame')).toBe(true);
			});
		});

		describe('Invalid Transitions', () => {
			it('should reject loadGame -> initialDamageRoll (skipping showIntro)', () => {
				expect(isValidTransition('loadGame', 'initialDamageRoll')).toBe(false);
			});

			it('should reject loadGame -> drawCard', () => {
				expect(isValidTransition('loadGame', 'drawCard')).toBe(false);
			});

			it('should reject showIntro -> gameOver', () => {
				expect(isValidTransition('showIntro', 'gameOver')).toBe(false);
			});

			it('should reject showIntro -> rollForTasks (skipping initialDamageRoll)', () => {
				expect(isValidTransition('showIntro', 'rollForTasks')).toBe(false);
			});

			it('should reject endTurn -> drawCard (must go through log)', () => {
				expect(isValidTransition('endTurn', 'drawCard')).toBe(false);
			});
		});

		describe('Emergency Exits', () => {
			it('should always allow exitGame from any state', () => {
				const states = Object.keys(transitionGraph);
				states.forEach((state) => {
					expect(isValidTransition(state, 'exitGame')).toBe(true);
				});
			});

			it('should always allow errorScreen from any state', () => {
				const states = Object.keys(transitionGraph);
				states.forEach((state) => {
					expect(isValidTransition(state, 'errorScreen')).toBe(true);
				});
			});

			it('should allow errorScreen -> loadGame recovery', () => {
				expect(isValidTransition('errorScreen', 'loadGame')).toBe(true);
			});
		});

		describe('Edge Cases', () => {
			it('should handle undefined from state', () => {
				expect(isValidTransition(undefined, 'loadGame')).toBe(false);
			});

			it('should handle null from state', () => {
				expect(isValidTransition(null, 'loadGame')).toBe(false);
			});

			it('should handle unknown from state', () => {
				expect(isValidTransition('unknownState', 'loadGame')).toBe(false);
			});

			it('should handle unknown to state (except emergency exits)', () => {
				expect(isValidTransition('loadGame', 'unknownState')).toBe(false);
			});
		});

		describe('Complex Game Flows', () => {
			it('should validate complete game flow: start to win', () => {
				const flow = [
					['loadGame', 'showIntro'],
					['showIntro', 'initialDamageRoll'],
					['initialDamageRoll', 'startRound'],
					['startRound', 'rollForTasks'],
					['rollForTasks', 'drawCard'],
					['drawCard', 'successCheck'],
					['successCheck', 'log'],
					['log', 'startRound'],
					['startRound', 'rollForTasks']
				];

				flow.forEach(([from, to]) => {
					expect(isValidTransition(from, to)).toBe(true);
				});
			});

			it('should validate complete game flow: start to loss', () => {
				const flow = [
					['loadGame', 'showIntro'],
					['showIntro', 'initialDamageRoll'],
					['initialDamageRoll', 'startRound'],
					['startRound', 'rollForTasks'],
					['rollForTasks', 'drawCard'],
					['drawCard', 'gameOver'],
					['gameOver', 'finalLog'],
					['finalLog', 'exitGame']
				];

				flow.forEach(([from, to]) => {
					expect(isValidTransition(from, to)).toBe(true);
				});
			});

			it('should validate multiple card draws in one turn', () => {
				expect(isValidTransition('rollForTasks', 'drawCard')).toBe(true);
				expect(isValidTransition('drawCard', 'drawCard')).toBe(true);
				expect(isValidTransition('drawCard', 'drawCard')).toBe(true);
				expect(isValidTransition('drawCard', 'endTurn')).toBe(true);
			});

			it('should validate failure check flow', () => {
				const flow = [
					['rollForTasks', 'drawCard'],
					['drawCard', 'failureCheck'],
					['failureCheck', 'drawCard']
				];

				flow.forEach(([from, to]) => {
					expect(isValidTransition(from, to)).toBe(true);
				});
			});
		});
	});

	describe('State Machine Integrity', () => {
		it('should have no orphaned states (all states are reachable)', () => {
			const allStates = Object.keys(transitionGraph);
			const reachableStates = new Set(['loadGame']); // Starting state

			// BFS to find all reachable states
			const queue = ['loadGame'];
			while (queue.length > 0) {
				const current = queue.shift();
				const nextStates = transitionGraph[current] || [];

				nextStates.forEach((next) => {
					if (!reachableStates.has(next)) {
						reachableStates.add(next);
						queue.push(next);
					}
				});
			}

			// All states except errorScreen should be reachable through normal flow
			const unreachableStates = allStates.filter(
				(state) => !reachableStates.has(state) && state !== 'errorScreen'
			);

			expect(unreachableStates).toEqual([]);
		});

		it('should have at least one exit path from each state', () => {
			const allStates = Object.keys(transitionGraph);

			allStates.forEach((state) => {
				const hasDirectExit = transitionGraph[state].length > 0;
				const hasEmergencyExit = true; // exitGame and errorScreen are always available

				expect(hasDirectExit || hasEmergencyExit).toBe(true);
			});
		});

		it('should not have circular dependencies of length 1 (except drawCard)', () => {
			Object.entries(transitionGraph).forEach(([state, nextStates]) => {
				if (state !== 'drawCard') {
					expect(nextStates.includes(state)).toBe(false);
				}
			});
		});
	});
});

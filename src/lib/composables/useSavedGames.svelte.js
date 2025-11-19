/**
 * useSavedGames - Saved games loading and sorting
 *
 * Manages loading completed games from IndexedDB and sorting them by various criteria.
 *
 * @returns {Object} Saved games state and control functions
 *
 * @example
 * const saves = useSavedGames();
 * saves.sortBy = 'won'; // Filter to victories only
 * const games = saves.sortedGames; // Get sorted/filtered games
 */

import { loadAllSaves } from '$lib/stores/indexedDBStorage.js';
import { logger } from '$lib/utils/logger.js';

export function useSavedGames() {
	let completedGames = $state([]);
	let isLoading = $state(true);
	let error = $state(null);
	let sortBy = $state('recent'); // recent, oldest, won, lost
	let mounted = $state(false);

	// Load completed games on mount (run only once)
	$effect(() => {
		if (!mounted) {
			mounted = true;
			loadCompletedGames();
		}
	});

	async function loadCompletedGames() {
		isLoading = true;
		error = null;

		try {
			const allSaves = await loadAllSaves();

			// Filter for completed games (won or lost)
			const completed = allSaves.filter((save) => {
				return save.isWon === true || save.isWon === false;
			});

			completedGames = completed;
		} catch (err) {
			logger.error('Failed to load completed games:', err);
			error = 'Failed to load saved games. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// Sort games
	let sortedGames = $derived.by(() => {
		const games = [...completedGames];

		switch (sortBy) {
			case 'recent':
				return games.sort((a, b) => {
					const dateA = new Date(a.lastPlayed || a.savedAt || 0);
					const dateB = new Date(b.lastPlayed || b.savedAt || 0);
					return dateB - dateA;
				});
			case 'oldest':
				return games.sort((a, b) => {
					const dateA = new Date(a.lastPlayed || a.savedAt || 0);
					const dateB = new Date(b.lastPlayed || b.savedAt || 0);
					return dateA - dateB;
				});
			case 'won':
				return games.filter((g) => g.isWon === true);
			case 'lost':
				return games.filter((g) => g.isWon === false);
			default:
				return games;
		}
	});

	function formatDate(dateString) {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDuration(rounds) {
		if (!rounds) return 'Unknown';
		if (rounds === 1) return '1 round';
		return `${rounds} rounds`;
	}

	return {
		get completedGames() {
			return completedGames;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get sortBy() {
			return sortBy;
		},
		set sortBy(value) {
			sortBy = value;
		},
		get sortedGames() {
			return sortedGames;
		},
		loadCompletedGames,
		formatDate,
		formatDuration
	};
}

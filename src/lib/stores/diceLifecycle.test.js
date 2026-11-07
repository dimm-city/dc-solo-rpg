/**
 * The dice renderer's lifecycle: one DiceBox (one WebGL context) for the life of the page.
 * A theme change loads the theme into the box instead of rebuilding it, leaving a game keeps
 * the box and clears the dice, and destroyDiceBox() undoes initialize(): renderer, context,
 * canvas, scene resources and the window resize listener dice-box registers and never removes.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const gameState = vi.hoisted(() => ({ config: null }));
vi.mock('./gameStore.svelte.js', () => ({ gameState }));

/** A geometry, material or texture that records its disposal */
const disposable = (extra = {}) => ({ dispose: vi.fn(), ...extra });

/**
 * A dice-box as initialize() leaves it: a renderer with a canvas in the container, a scene
 * with a desk and a light, a resize listener on the window, a dice material cache and the
 * sound buffers. Theme and sound loading are recorded.
 */
class FakeDiceBox {
	constructor(selector, config) {
		this.container = document.querySelector(selector);
		this.config = config;
		Object.assign(
			this,
			{
				theme_colorset: 'white',
				theme_texture: '',
				theme_material: 'glass',
				theme_customColorset: null,
				sounds: true
			},
			config
		);
		this.diceList = [];
		this.scene = {
			children: [],
			add: (object) => this.scene.children.push(object),
			remove: vi.fn((object) => {
				this.scene.children = this.scene.children.filter((child) => child !== object);
			}),
			traverse: (fn) => this.scene.children.forEach(fn)
		};
		this.world = { removeBody: vi.fn() };
		this.display = {
			currentWidth: 720,
			currentHeight: 450,
			containerWidth: 1440,
			containerHeight: 900
		};
		this.desk = {
			geometry: disposable(),
			material: disposable({ map: { isTexture: true, dispose: vi.fn() } })
		};
		this.light = { dispose: vi.fn() };
		this.DiceFactory = {
			materials_cache: { 'd20-fire': { composite: disposable(), bump: disposable() } }
		};
		this.sounds_table = { felt: ['surface'] };
		this.sounds_dice = { plastic: ['hit'] };
	}

	initialize = vi.fn(async () => {
		const canvas = document.createElement('canvas');
		this.renderer = {
			domElement: canvas,
			render: vi.fn(),
			dispose: vi.fn(),
			forceContextLoss: vi.fn()
		};
		this.container.appendChild(canvas);
		this.resizeWorld();
		this.scene.add(this.desk);
		this.scene.add(this.light);
	});

	/** As the library's own: an anonymous listener nothing can remove */
	resizeWorld() {
		window.addEventListener('resize', () => {});
	}

	loadTheme = vi.fn(async () => {});
	loadSounds = vi.fn(async () => {});
	clearDice = vi.fn(() => {
		this.diceList.length = 0;
	});
	setDimensions = vi.fn();
	getNotationVectors = vi.fn(() => ({ vectors: [] }));
}

const DiceBoxMock = vi.fn(function (selector, config) {
	return new FakeDiceBox(selector, config);
});
vi.mock('@3d-dice/dice-box-threejs', () => ({ default: DiceBoxMock }));

const {
	initializeDiceBox,
	updateDiceTheme,
	resetDiceBox,
	destroyDiceBox,
	isDiceBoxInitialized,
	diceState,
	themeSettings
} = await import('./diceStore.svelte.js');

/** The box the store made last */
const box = () => DiceBoxMock.mock.results.at(-1).value;
/** A die on the table, as spawnDice leaves it */
const die = () => ({ body: {}, geometry: disposable(), material: [disposable()] });
/** The window resize listeners added, or removed, since the spies were set */
const resizeListeners = (spy) =>
	spy.mock.calls.filter(([type]) => type === 'resize').map(([, handler]) => handler);

let container;

beforeEach(async () => {
	gameState.config = { options: { dice: { key: 'fire' } } };
	DiceBoxMock.mockClear();
	document.body.innerHTML = '<div id="dice-roller-container"></div>';
	container = document.getElementById('dice-roller-container');
	vi.spyOn(window, 'addEventListener');
	vi.spyOn(window, 'removeEventListener');
	await initializeDiceBox(container);
});

afterEach(() => {
	destroyDiceBox();
	vi.restoreAllMocks();
});

describe('themeSettings', () => {
	it('names a built-in colorset by key, none for "default" (the library white), and the custom set as itself', () => {
		expect(themeSettings({ key: 'fire' })).toEqual({ theme_colorset: 'fire' });
		expect(themeSettings({ key: 'default' })).toEqual({});
		const custom = { foreground: '#fff', background: '#000', texture: 'metal' };
		expect(themeSettings(custom)).toEqual({ theme_customColorset: custom });
		expect(themeSettings(undefined)).toEqual({ theme_colorset: 'pinkdreams' });
	});
});

describe('a theme change', () => {
	it('keeps the box and loads the theme into it: no new renderer, no new canvas', async () => {
		const first = box();
		const canvas = container.querySelector('canvas');

		await updateDiceTheme({ key: 'ice' });

		expect(DiceBoxMock).toHaveBeenCalledTimes(1);
		expect(first.initialize).toHaveBeenCalledTimes(1);
		expect(first.loadTheme).toHaveBeenCalledWith({
			colorset: 'ice',
			texture: '',
			material: 'glass'
		});
		expect(first.theme_colorset).toBe('ice');
		expect(first.theme_customColorset).toBeNull();
		expect(first.loadSounds).toHaveBeenCalledTimes(1);
		expect(container.querySelectorAll('canvas')).toHaveLength(1);
		expect(container.querySelector('canvas')).toBe(canvas);
		expect(first.renderer.dispose).not.toHaveBeenCalled();
		expect(gameState.config.options.dice).toEqual({ key: 'ice' });
	});

	it('loads dice-box\'s own white set for "default"', async () => {
		await updateDiceTheme({ key: 'default' });
		expect(box().loadTheme).toHaveBeenCalledWith(expect.objectContaining({ colorset: 'white' }));
	});

	it('does not reload the theme the box already shows', async () => {
		await updateDiceTheme({ key: 'fire' });
		expect(box().loadTheme).not.toHaveBeenCalled();
	});

	it('changes only the config when there is no box yet', async () => {
		destroyDiceBox();
		DiceBoxMock.mockClear();
		await updateDiceTheme({ key: 'ice' });
		expect(DiceBoxMock).not.toHaveBeenCalled();
		expect(gameState.config.options.dice).toEqual({ key: 'ice' });
	});

	it('rebuilds the box when the theme cannot be loaded, destroying the old renderer first', async () => {
		const first = box();
		first.loadTheme.mockRejectedValueOnce(new Error('Unable to load theme'));

		await updateDiceTheme({ key: 'ice' });

		expect(DiceBoxMock).toHaveBeenCalledTimes(2);
		expect(first.renderer.dispose).toHaveBeenCalled();
		expect(first.renderer.forceContextLoss).toHaveBeenCalled();
		expect(box()).not.toBe(first);
		expect(box().config.theme_colorset).toBe('ice');
		expect(container.querySelectorAll('canvas')).toHaveLength(1);
		expect(container.querySelector('canvas')).toBe(box().renderer.domElement);
	});
});

describe('leaving a game (resetDiceBox)', () => {
	it('clears the dice and the roll state but keeps the box and its canvas', () => {
		const first = box();
		first.diceList.push(die());
		diceState.isRolling = true;
		diceState.lastRoll = { rolls: [3], finalValue: 3 };
		diceState.staticRoll = { rolls: [3], kept: 3 };
		diceState.sinkOrigin = '10px 20px';

		resetDiceBox();

		expect(first.clearDice).toHaveBeenCalled();
		expect(diceState).toMatchObject({
			isRolling: false,
			lastRoll: null,
			staticRoll: null,
			sinkOrigin: null
		});
		expect(isDiceBoxInitialized()).toBe(true);
		expect(container.querySelector('canvas')).toBe(first.renderer.domElement);
		expect(first.renderer.dispose).not.toHaveBeenCalled();
	});

	it("the next game reuses the box, in that game's theme: no new renderer", async () => {
		const first = box();
		resetDiceBox();
		gameState.config = { options: { dice: { key: 'ice' } } };

		expect(await initializeDiceBox(container)).toBe(first);

		expect(DiceBoxMock).toHaveBeenCalledTimes(1);
		expect(first.initialize).toHaveBeenCalledTimes(1);
		expect(first.loadTheme).toHaveBeenCalledWith(expect.objectContaining({ colorset: 'ice' }));
		expect(container.querySelectorAll('canvas')).toHaveLength(1);
	});

	it('a next game in the same theme loads nothing', async () => {
		resetDiceBox();
		expect(await initializeDiceBox(container)).toBe(box());
		expect(box().loadTheme).not.toHaveBeenCalled();
	});
});

describe('destroyDiceBox', () => {
	it('disposes the renderer, releases its WebGL context and removes the canvas', () => {
		const first = box();
		destroyDiceBox();
		expect(first.renderer.dispose).toHaveBeenCalledTimes(1);
		expect(first.renderer.forceContextLoss).toHaveBeenCalledTimes(1);
		expect(container.querySelector('canvas')).toBeNull();
		expect(isDiceBoxInitialized()).toBe(false);
	});

	it('removes the dice and disposes every geometry, material and texture, the material cache included', () => {
		const first = box();
		const landed = die();
		first.diceList.push(landed);
		first.scene.add(landed);

		destroyDiceBox();

		expect(first.scene.remove).toHaveBeenCalledWith(landed);
		expect(first.world.removeBody).toHaveBeenCalledWith(landed.body);
		expect(first.diceList).toHaveLength(0);
		expect(first.desk.geometry.dispose).toHaveBeenCalled();
		expect(first.desk.material.dispose).toHaveBeenCalled();
		expect(first.desk.material.map.dispose).toHaveBeenCalled();
		expect(first.light.dispose).toHaveBeenCalled();
		for (const entry of [landed.geometry, landed.material[0]]) {
			expect(entry.dispose).toHaveBeenCalled();
		}
		expect(first.DiceFactory.materials_cache).toEqual({});
	});

	it("removes the window resize listener (dice-box's own could never be removed)", () => {
		const added = resizeListeners(window.addEventListener);
		expect(added).toHaveLength(1);
		destroyDiceBox();
		expect(resizeListeners(window.removeEventListener)).toEqual(added);
	});

	it('drops the sound buffers and the roll state; the next initializeDiceBox makes a new box', async () => {
		const first = box();
		diceState.isRolling = true;
		destroyDiceBox();
		expect(first.sounds_table).toEqual({});
		expect(first.sounds_dice).toEqual([]);
		expect(diceState.isRolling).toBe(false);

		await initializeDiceBox(container);
		expect(DiceBoxMock).toHaveBeenCalledTimes(2);
		expect(box()).not.toBe(first);
		expect(container.querySelectorAll('canvas')).toHaveLength(1);
	});
});

describe('initializeDiceBox with a box whose canvas is gone', () => {
	it('destroys it before making another, so its renderer is not left behind', async () => {
		const first = box();
		container.innerHTML = '';

		await initializeDiceBox(container);

		expect(first.renderer.dispose).toHaveBeenCalled();
		expect(first.renderer.forceContextLoss).toHaveBeenCalled();
		expect(DiceBoxMock).toHaveBeenCalledTimes(2);
		expect(container.querySelectorAll('canvas')).toHaveLength(1);
	});

	it('destroys a box whose initialize() failed, releasing the renderer it had made', async () => {
		destroyDiceBox();
		DiceBoxMock.mockImplementationOnce(function (selector, config) {
			const failing = new FakeDiceBox(selector, config);
			failing.initialize = vi.fn(async () => {
				failing.renderer = {
					domElement: document.createElement('canvas'),
					dispose: vi.fn(),
					forceContextLoss: vi.fn()
				};
				failing.container.appendChild(failing.renderer.domElement);
				throw new Error('Unable to load theme');
			});
			return failing;
		});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(await initializeDiceBox(container)).toBeNull();

		const failed = box();
		expect(failed.renderer.dispose).toHaveBeenCalled();
		expect(failed.renderer.forceContextLoss).toHaveBeenCalled();
		expect(container.querySelector('canvas')).toBeNull();
		expect(isDiceBoxInitialized()).toBe(false);
	});
});

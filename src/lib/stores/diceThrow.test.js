/**
 * The throw (throwVectors / installThrow), against the real dice-box-threejs library and its
 * cannon physics, with no rendering: the bug the owner saw on a phone ("the dice only roll in
 * the top-left corner") is a die that starts inside dice-box's wall and loses its throw to the
 * wall's friction on the first physics step.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DiceBox from '@3d-dice/dice-box-threejs';
import { throwVectors, installThrow, MIN_THROW, SPAWN_MARGIN } from './diceStore.svelte.js';

/** The owner's phone: 393 x 851 CSS px (dice-box's world is in half-px units) */
const PHONE = { width: 393, height: 851 };

/** A DiceBox as initialize() leaves it for a screen, without a renderer: the world and its walls */
function makeBox({ width, height }) {
	document.body.innerHTML = '<div id="dice-roller-container"></div>';
	const box = new DiceBox('#dice-roller-container', { baseScale: 100, strength: 1.5 });
	box.display.currentWidth = width / 2;
	box.display.currentHeight = height / 2;
	box.display.containerWidth = width;
	box.display.containerHeight = height;
	box.world.gravity.set(0, 0, -9.8 * box.gravity_multiplier);
	box.world.solver.iterations = 14;
	box.world.allowSleep = true;
	box.makeWorldBox();
	return box;
}

/** A d20 body from a throw vector, as spawnDice makes it (the mesh and its materials left out) */
function spawnDie(box, vector) {
	const Body = box.box_body.desk.constructor;
	const Vec3 = box.box_body.desk.position.constructor;
	const geometry = box.DiceFactory.createGeometry('d20', box.baseScale);
	const body = new Body({
		allowSleep: true,
		sleepSpeedLimit: 75,
		sleepTimeLimit: 0.9,
		mass: 400,
		shape: geometry.cannon_shape,
		material: box.dice_body_material
	});
	body.position.set(vector.pos.x, vector.pos.y, vector.pos.z);
	body.quaternion.setFromAxisAngle(
		new Vec3(vector.axis.x, vector.axis.y, vector.axis.z),
		vector.axis.a * Math.PI * 2
	);
	body.angularVelocity.set(vector.angle.x, vector.angle.y, vector.angle.z);
	body.velocity.set(vector.velocity.x, vector.velocity.y, vector.velocity.z);
	body.linearDamping = 0.1;
	body.angularDamping = 0.1;
	box.world.addBody(body);
	return body;
}

const speed = (body) => Math.hypot(body.velocity.x, body.velocity.y);
const radius = (box) =>
	box.DiceFactory.createGeometry('d20', box.baseScale).cannon_shape.boundingSphereRadius;

/** |q|² of a body's quaternion: 1 for a unit quaternion; the collision shape is scaled by this */
const quaternionScale = (body) => {
	const q = body.quaternion;
	return q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
};

beforeEach(() => {
	// Deterministic throws. 0.8 gives dice-box's spin axis (0.8, 0.8, 0.8): with its angle, a
	// quaternion of |q|² 1.32, so the library's die is a third too big on its first step
	vi.spyOn(Math, 'random').mockReturnValue(0.8);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('the throw on a phone (real dice-box physics)', () => {
	it('dice-box itself starts a die thrown from the left edge inside the wall, oversized, and the first step kills the throw', () => {
		const box = makeBox(PHONE);
		// A throw aimed down and to the right, as most are: the die starts at the left edge
		const target = { x: 150, y: -150 };
		const distance = Math.hypot(target.x, target.y) + 100;
		const vectors = box.getNotationVectors(
			'1d20@10',
			target,
			3.5 * distance * box.strength,
			distance
		);
		const [vector] = vectors.vectors;
		const r = radius(box);
		expect(r).toBe(100);
		// 0.9 of the half-size out, with the wall at 0.93: inside it by most of its radius
		expect(Math.abs(vector.pos.x) + r).toBeGreaterThan(0.93 * PHONE.width);
		// The spin axis is not a unit vector
		expect(Math.hypot(vector.axis.x, vector.axis.y, vector.axis.z)).toBeCloseTo(
			Math.hypot(0.8, 0.8, 0.8)
		);

		const die = spawnDie(box, vector);
		expect(quaternionScale(die)).toBeGreaterThan(1.3); // a third too big for its first step
		const thrown = { x: die.velocity.x, y: die.velocity.y };
		expect(Math.hypot(thrown.x, thrown.y)).toBeGreaterThan(1000);
		box.world.step(box.framerate);
		// The wall contact's friction has swallowed the throw along the wall; what is left is the
		// wall pushing the die out (a straight line away from the edge)
		expect(Math.abs(die.velocity.y)).toBeLessThan(0.3 * Math.abs(thrown.y));
		expect(die.velocity.x).toBeGreaterThan(thrown.x);
	});

	it('a die clear of the walls by its radius still loses its throw to the oversized first step', () => {
		const box = makeBox(PHONE);
		const target = { x: 150, y: -150 };
		const distance = Math.hypot(target.x, target.y) + 100;
		const vectors = box.getNotationVectors(
			'1d20@10',
			target,
			3.5 * distance * box.strength,
			distance
		);
		const [vector] = vectors.vectors;
		// Where throwVectors would start it (its radius and margin inside the walls), but with
		// dice-box's own spin axis
		vector.pos.x = -(0.93 * PHONE.width - 100 - SPAWN_MARGIN);
		vector.pos.y = 0.93 * PHONE.height - 100 - SPAWN_MARGIN;
		const die = spawnDie(box, vector);
		const thrown = speed(die);
		box.world.step(box.framerate);
		expect(speed(die)).toBeLessThan(thrown * 0.8);
	});

	it('throwVectors starts every die clear of the walls, and the throw survives the first steps', () => {
		const box = makeBox(PHONE);
		const vectors = throwVectors(box, '2d20@19,5');
		expect(vectors.vectors).toHaveLength(2);
		const r = radius(box);
		for (const vector of vectors.vectors) {
			expect(Math.abs(vector.pos.x) + r + SPAWN_MARGIN).toBeLessThanOrEqual(0.93 * PHONE.width);
			expect(Math.abs(vector.pos.y) + r + SPAWN_MARGIN).toBeLessThanOrEqual(0.93 * PHONE.height);
		}
		for (const vector of vectors.vectors) {
			expect(Math.hypot(vector.axis.x, vector.axis.y, vector.axis.z)).toBeCloseTo(1);
		}
		const die = spawnDie(box, vectors.vectors[0]);
		expect(quaternionScale(die)).toBeCloseTo(1);
		const thrown = speed(die);
		for (let i = 0; i < 5; i++) box.world.step(box.framerate);
		expect(speed(die)).toBeGreaterThan(thrown * 0.95);
	});

	it('a spin axis of zero length becomes a unit axis', () => {
		const box = makeBox(PHONE);
		Math.random.mockReturnValue(0);
		const [vector] = throwVectors(box, '1d20@10').vectors;
		expect([vector.axis.x, vector.axis.y, vector.axis.z]).toEqual([0, 0, 1]);
	});

	it('never throws from too close: the target is at least MIN_THROW of the shorter half-size out', () => {
		const box = makeBox(PHONE);
		Math.random.mockReturnValue(0.6); // a target 234 out, nearer than the 295 least
		const spy = vi.spyOn(box, 'getNotationVectors');
		throwVectors(box, '1d20@10');
		const [, target, magnitude, distance] = spy.mock.calls[0];
		const length = Math.hypot(target.x, target.y);
		const least = MIN_THROW * Math.min(box.display.currentWidth, box.display.currentHeight);
		expect(length).toBeGreaterThanOrEqual(least - 1e-9);
		// The speed is dice-box's own: (random + 3) * (distance + 100) * strength
		expect(distance).toBeCloseTo(length + 100);
		expect(magnitude).toBeCloseTo((0.6 + 3) * distance * box.strength);
		// Still thrown down and to the right, as dice-box's bias has it
		expect(target.x).toBeGreaterThan(0);
		expect(target.y).toBeLessThan(0);
	});

	it('keeps a target that is already far enough', () => {
		const box = makeBox({ width: 1440, height: 900 });
		Math.random.mockReturnValue(0.95); // far down and to the right
		const spy = vi.spyOn(box, 'getNotationVectors');
		throwVectors(box, '1d20@10');
		const [, target] = spy.mock.calls[0];
		expect(target.x).toBeCloseTo((0.95 * 2 - 0.5) * 720);
		expect(target.y).toBeCloseTo(-(0.95 * 2 - 0.5) * 450);
	});

	it('installThrow makes the box throw this way, and clears a throw still rolling', () => {
		const box = makeBox(PHONE);
		expect(installThrow(box)).toBe(true);
		box.rolling = true;
		const clear = vi.spyOn(box, 'clearDice').mockImplementation(() => {});
		const vectors = box.startClickThrow('1d20@7');
		expect(clear).toHaveBeenCalled();
		expect(box.rolling).toBe(false);
		expect(vectors.vectors[0].pos.x).toBeLessThanOrEqual(
			0.93 * PHONE.width - radius(box) - SPAWN_MARGIN
		);
	});

	it('installThrow leaves a box it does not recognise alone', () => {
		expect(installThrow({})).toBe(false);
		expect(installThrow(null)).toBe(false);
		const other = { getNotationVectors: () => ({ vectors: [] }) };
		expect(installThrow(other)).toBe(false);
		expect(other.startClickThrow).toBeUndefined();
	});
});

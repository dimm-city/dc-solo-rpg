function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export const d6 = () => getRandomNumber(1, 6);
export const d20 = () => getRandomNumber(1, 20);
export const roll = (max) => getRandomNumber(1, max);

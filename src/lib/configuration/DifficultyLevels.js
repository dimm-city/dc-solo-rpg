class DifficultyLevels {
    constructor() {
        this.IMPOSSIBLE = 0;
        this.VERY_HARD = 1;
        this.HARD = 2;
        this.MEDIUM = 3;
        this.EASY = 4;
    }

    // Method to get all entries as an array of objects
    getEntries() {
        return Object.keys(this).map(key => ({ key, value: this[key] }));
    }
}

export const Difficulty = new DifficultyLevels();

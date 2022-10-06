type Grid = number[][];

const createGrid = (width: number, height: number, random = false) => {
	const grid: Grid = [];
	for (let i = 0; i < height; i++)
		grid.push(Array.from(Array(width), () => random ? (Math.random() > 0.7 ? 1 : 0) : 0));

	return grid;
}

export { createGrid }
export type { Grid }
import React, { useCallback, useEffect, useRef, useState } from "react";
import { mdiClockOutline, mdiPlay, mdiPause, mdiRefresh, mdiShuffle, mdiSwapHorizontal, mdiSwapVertical } from "@mdi/js";
import Icon from "@mdi/react";

import { createGrid } from "./utils";

const MAX_GRID_WIDTH = Math.floor(window.innerWidth / 15);
const MAX_GRID_HEIGHT = Math.floor(window.innerHeight / 15);
const DEFAULT_LOOP_TIME = 100;

type GridSize = {
	width: number,
	height: number
}

const App: React.FC = () => {
	const [playing, setPlaying] = useState(false);
	const playingRef = useRef(playing);
	playingRef.current = playing;

	const [loopTime, setLoopTime] = useState(DEFAULT_LOOP_TIME);

	const [maxSize, setMaxSize] = useState<GridSize>({ width: MAX_GRID_WIDTH, height: MAX_GRID_HEIGHT });
	const [gridSize, setGridSize] = useState<GridSize>({ width: MAX_GRID_WIDTH, height: MAX_GRID_HEIGHT });
	const [grid, setGrid] = useState(createGrid(gridSize.width, gridSize.height));

	const inputWidthRef = useRef<HTMLInputElement>(null);
	const inputHeightRef = useRef<HTMLInputElement>(null);
	const inputTimeRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleScreenResize = () => {
			setMaxSize({ width: Math.floor(window.innerWidth / 15), height: Math.floor(window.innerHeight / 15) });
		}

		window.addEventListener("resize", handleScreenResize, false);
		return () => {
			window.removeEventListener("resize", handleScreenResize, false);
		}
	}, []);

	useEffect(() => {
		setGrid(createGrid(gridSize.width, gridSize.height, true));
		document.documentElement.style.setProperty("--grid-columns", gridSize.width.toString());
	}, [gridSize]);

	const changeGridSize = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const inputWidth = document.getElementById("input-width") as HTMLInputElement;
		const inputHeight = document.getElementById("input-height") as HTMLInputElement;
		if (inputWidth && inputHeight) {
			const width = Math.min(maxSize.width, Math.max(Number(inputWidth.value), 10));
			const height = Math.min(maxSize.height, Math.max(Number(inputHeight.value), 10));
			setGridSize({ width, height });

			if (inputWidthRef.current && inputHeightRef.current) {
				inputWidthRef.current.value = width.toString();
				inputHeightRef.current.value = height.toString();
			}
		}

		const target = e.target as HTMLFormElement;
		if (inputHeightRef.current) {
			if (target.children[0].id === "input-width")
				inputHeightRef.current.focus();
			else
				inputHeightRef.current.blur();
		}
		if (target.children[0].id === "input-width" && inputHeightRef.current) {
			inputHeightRef.current.focus();
		}
	}

	const changeLoopTime = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const inputLoop = document.getElementById("input-loop") as HTMLInputElement;
		if (inputLoop) {
			const time = Math.min(1000, Math.max(Number(inputLoop.value), 25));
			setLoopTime(time);

			if (inputTimeRef.current)
				inputTimeRef.current.value = time.toString();
		}
	}

	const calculateNextGeneration = useCallback(() => {
		if (!playingRef.current)
			return;

		setGrid(oldGrid => {
			const newGrid = structuredClone(oldGrid);
			for (let y = 0; y < gridSize.height; y++) {
				for (let x = 0; x < gridSize.width; x++) {
					let neighbors = 0;
					for (let dy = -1; dy <= 1; dy++) {
						for (let dx = -1; dx <= 1; dx++) {
							let nx = (x + dx);
							let ny = (y + dy);

							if (!(dx === 0 && dy === 0) && nx >= 0 && nx < gridSize.width && ny >= 0 && ny < gridSize.height) {
								neighbors += oldGrid[ny][nx];
							}
						}
					}

					if (neighbors < 2 || neighbors > 3)
						newGrid[y][x] = 0;
					else if (oldGrid[y][x] === 0 && neighbors === 3)
						newGrid[y][x] = 1;
				}
			}

			return newGrid;
		});

		setTimeout(calculateNextGeneration, loopTime);
	}, [gridSize, loopTime]);

	const playGame = () => {
		setPlaying(p => !p);
		if (!playing) {
			playingRef.current = true;
			calculateNextGeneration();
		}
	}

	const randomizeGrid = () => {
		const width = Math.min(maxSize.width, gridSize.width);
		const height = Math.min(maxSize.height, gridSize.height);
		setGridSize({ width, height });
		setGrid(createGrid(width, height, true));
	}

	const updateCell = (x: number, y: number) => {
		setGrid(oldGrid => {
			const newGrid = structuredClone(oldGrid);
			newGrid[y][x] = grid[y][x] ? 0 : 1;
			return newGrid;
		})
	}

	return (
		<>
			<div id="header">
				<div id="header-content">
					<div className="menu">
						<h1>Game of Life</h1>
						<a className={playing ? "playing" : undefined} onClick={playGame}><Icon path={playing ? mdiPause : mdiPlay} size={1} /></a>
						<a onClick={() => setGrid(createGrid(gridSize.width, gridSize.height))}><Icon path={mdiRefresh} size={1} /></a>
						<a onClick={randomizeGrid} ><Icon path={mdiShuffle} size={1} /></a>
					</div>
					<div className="menu">
						<Icon path={mdiSwapHorizontal} size={1} />
						<form onSubmit={changeGridSize}>
							<input ref={inputWidthRef} id="input-width" type={"number"} defaultValue={gridSize.width} />
						</form>
						<Icon path={mdiSwapVertical} size={1} />
						<form onSubmit={changeGridSize}>
							<input ref={inputHeightRef} id="input-height" type={"number"} defaultValue={gridSize.height} />
						</form>
						<div className="divider" />
						<Icon path={mdiClockOutline} size={1} />
						<form onSubmit={changeLoopTime}>
							<input ref={inputTimeRef} id="input-loop" type={"number"} defaultValue={loopTime} />
						</form>
					</div>
				</div>
			</div>
			<div id="game-area">
				<div id="grid">
					{
						grid.map((row, i) => row.map((col, j) => (
							<div onClick={() => updateCell(j, i)} className="grid-item" style={{ backgroundColor: grid[i][j] ? "white" : undefined }} />
						)))
					}
				</div>
			</div>
		</>
	)
}

export default App;
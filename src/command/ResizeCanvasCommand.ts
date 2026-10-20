import { DocumentStore } from "../model/DocumentStore.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class ResizeCanvasCommand implements UndoableCommand {
	private previousWidth: number | undefined;
	private previousHeight: number | undefined;

	constructor(
		private readonly store: DocumentStore,
		private readonly width: number,
		private readonly height: number,
	) {}

	execute(): string {
		if (this.width <= 0 || this.height <= 0) {
			return "error: canvas dimensions must be positive";
		}

		const document = this.store.getDocument();
		this.previousWidth = document.width;
		this.previousHeight = document.height;
		document.resizeCanvas(this.width, this.height);
		return `canvas ${this.width}x${this.height} resized`;
	}

	undo(): string {
		const document = this.store.getDocument();
		const width = this.previousWidth!;
		const height = this.previousHeight!;
		document.resizeCanvas(width, height);
		return `canvas ${width}x${height} resized`;
	}

	redo(): string {
		return this.execute();
	}
}

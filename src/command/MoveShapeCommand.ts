import { DocumentStore } from "../model/DocumentStore.js";

import { INVALID_ARGUMENTS } from "./CommandMessages.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class MoveShapeCommand implements UndoableCommand {
	constructor(
		private readonly store: DocumentStore,
		private readonly shapeId: string,
		private readonly dx: number,
		private readonly dy: number,
	) {}

	execute(): string {
		return this.apply(this.dx, this.dy, "forward");
	}

	undo(): string {
		return this.apply(-this.dx, -this.dy, "back");
	}

	redo(): string {
		return this.apply(this.dx, this.dy, "forward");
	}

	private apply(dx: number, dy: number, direction: "forward" | "back"): string {
		if (!Number.isFinite(this.dx) || !Number.isFinite(this.dy)) {
			return INVALID_ARGUMENTS;
		}

		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		shape.translate(dx, dy);

		if (shape.isComposite()) {
			if (direction === "forward") {
				return `g#${this.shapeId} moved by (${this.dx},${this.dy})`;
			}
			return `g#${this.shapeId} moved back by (${-this.dx},${-this.dy})`;
		}

		const type = shape.typeLabel();
		const position = shape.movePositionLabel();
		if (direction === "forward") {
			return `${type}#${this.shapeId} moved to ${position}`;
		}
		return `${type}#${this.shapeId} moved back to ${position}`;
	}
}

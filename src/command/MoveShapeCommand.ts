import { CircleShape } from "../model/CircleShape.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { GroupShape } from "../model/GroupShape.js";
import { RectShape } from "../model/RectShape.js";
import { shapeTypeLabel, translateShape } from "../model/ShapeTransform.js";
import type { Shape } from "../model/Shape.js";

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

		if (shape instanceof GroupShape) {
			translateShape(shape, dx, dy);
			if (direction === "forward") {
				return `g#${this.shapeId} moved by (${this.dx},${this.dy})`;
			}
			return `g#${this.shapeId} moved back by (${-this.dx},${-this.dy})`;
		}

		translateShape(shape, dx, dy);
		const type = shapeTypeLabel(shape);
		const position = MoveShapeCommand.formatPosition(shape);
		if (direction === "forward") {
			return `${type}#${this.shapeId} moved to ${position}`;
		}
		return `${type}#${this.shapeId} moved back to ${position}`;
	}

	private static formatPosition(shape: Shape): string {
		if (shape instanceof CircleShape) {
			return `(${shape.cx},${shape.cy})`;
		}
		if (shape instanceof RectShape) {
			return `(${shape.x},${shape.y})`;
		}
		return `(0,0)`;
	}
}

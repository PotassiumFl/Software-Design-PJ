import { DocumentStore } from "../model/DocumentStore.js";
import { scaleShape, shapeTypeLabel } from "../model/ShapeTransform.js";

import { INVALID_ARGUMENTS } from "./CommandMessages.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class ScaleShapeCommand implements UndoableCommand {
	private scaled = false;

	constructor(
		private readonly store: DocumentStore,
		private readonly shapeId: string,
		private readonly factor: number,
	) {}

	execute(): string {
		if (!Number.isFinite(this.factor)) {
			return INVALID_ARGUMENTS;
		}
		if (this.factor <= 0) {
			return "error: scale factor must be positive";
		}

		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		scaleShape(shape, this.factor);
		this.scaled = true;

		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} scaled by ${this.factor}`;
	}

	undo(): string {
		if (!this.scaled) {
			return "error: nothing to undo";
		}
		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		scaleShape(shape, 1 / this.factor);
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} scaled by ${1 / this.factor}`;
	}

	redo(): string {
		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}
		scaleShape(shape, this.factor);
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} scaled by ${this.factor}`;
	}
}

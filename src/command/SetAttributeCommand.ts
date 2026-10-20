import { DocumentStore } from "../model/DocumentStore.js";
import { TextShape } from "../model/TextShape.js";
import { shapeTypeLabel } from "../model/ShapeTransform.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class SetAttributeCommand implements UndoableCommand {
	private previousValue: string | undefined;

	constructor(
		private readonly store: DocumentStore,
		private readonly shapeId: string,
		private readonly attribute: string,
		private readonly value: string,
	) {}

	execute(): string {
		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		if (!(shape instanceof TextShape) || this.attribute !== "text") {
			return `error: unknown attribute: ${this.attribute}`;
		}

		this.previousValue = shape.content;
		shape.content = this.value;
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} updated: text="${this.value}"`;
	}

	undo(): string {
		if (this.previousValue === undefined) {
			return "error: nothing to undo";
		}
		const shape = this.store.getDocument().findById(this.shapeId);
		if (!(shape instanceof TextShape)) {
			return `error: no such shape: ${this.shapeId}`;
		}
		shape.content = this.previousValue;
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} updated: text="${this.previousValue}"`;
	}

	redo(): string {
		return this.execute();
	}
}

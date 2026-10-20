import { DocumentStore } from "../model/DocumentStore.js";
import { GroupShape } from "../model/GroupShape.js";
import type { Shape } from "../model/Shape.js";
import { shapeTypeLabel } from "../model/ShapeTransform.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class DeleteShapeCommand implements UndoableCommand {
	private deleted:
		| {
				shape: Shape;
				parent: GroupShape | null;
				index: number;
				type: string;
		  }
		| undefined;

	constructor(
		private readonly store: DocumentStore,
		private readonly shapeId: string,
	) {}

	execute(): string {
		const document = this.store.getDocument();
		const shape = document.findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		const type = shapeTypeLabel(shape);
		const parent = document.findParentContainer(shape);
		const index = document.getShapeIndexInParent(shape, parent);
		document.removeShape(this.shapeId);

		this.deleted = { shape, parent, index, type };
		return `${type}#${this.shapeId} deleted`;
	}

	undo(): string {
		if (!this.deleted) {
			return "error: nothing to undo";
		}
		const { shape, parent, index, type } = this.deleted;
		this.store.getDocument().restoreDeletedShape(shape, parent, index);

		if (parent) {
			return `${type}#${shape.id} restored into g#${parent.id}`;
		}
		return `${type}#${shape.id} restored`;
	}

	redo(): string {
		return this.execute();
	}
}

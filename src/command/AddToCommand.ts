import { DocumentStore } from "../model/DocumentStore.js";
import { GroupShape } from "../model/GroupShape.js";
import { shapeTypeLabel } from "../model/ShapeTransform.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class AddToCommand implements UndoableCommand {
	constructor(
		private readonly store: DocumentStore,
		private readonly containerId: string,
		private readonly shapeId: string,
	) {}

	execute(): string {
		const document = this.store.getDocument();
		const shape = document.findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		const container = document.findById(this.containerId);
		if (!container) {
			return `error: no such container: ${this.containerId}`;
		}
		if (!(container instanceof GroupShape)) {
			return `error: not a container: ${this.containerId}`;
		}

		document.reparentExistingShapeToContainer(this.containerId, shape);
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} added to g#${this.containerId}`;
	}

	undo(): string {
		return "error: nothing to undo";
	}

	redo(): string {
		return "error: nothing to redo";
	}
}

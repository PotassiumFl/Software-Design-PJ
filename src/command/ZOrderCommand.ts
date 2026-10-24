import { DocumentStore } from "../model/DocumentStore.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export type ZOrderDirection = "front" | "back";

export class ZOrderCommand implements UndoableCommand {
	private previousIndex: number | undefined;

	constructor(
		private readonly store: DocumentStore,
		private readonly shapeId: string,
		private readonly direction: ZOrderDirection,
	) {}

	execute(): string {
		const document = this.store.getDocument();
		const shape = document.findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		const parent = document.findParentContainer(shape);
		this.previousIndex = document.getShapeIndexInParent(shape, parent);

		if (this.direction === "front") {
			document.moveShapeToFront(this.shapeId);
			return `${shape.typeLabel()}#${this.shapeId} moved to front`;
		}

		document.moveShapeToBack(this.shapeId);
		return `${shape.typeLabel()}#${this.shapeId} moved to back`;
	}

	undo(): string {
		const document = this.store.getDocument();
		const shape = document.findById(this.shapeId)!;
		const parent = document.findParentContainer(shape);
		document.reinsertShapeAt(shape, parent, this.previousIndex!);

		if (this.direction === "front") {
			return `${shape.typeLabel()}#${this.shapeId} moved to back`;
		}
		return `${shape.typeLabel()}#${this.shapeId} moved to front`;
	}

	redo(): string {
		return this.execute();
	}
}

import { DocumentStore } from "../model/DocumentStore.js";
import { GroupShape } from "../model/GroupShape.js";
import type { Shape } from "../model/Shape.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class UngroupCommand implements UndoableCommand {
	private undoState:
		| {
				parent: GroupShape | null;
				index: number;
				children: Shape[];
		  }
		| undefined;

	constructor(
		private readonly store: DocumentStore,
		private readonly groupId: string,
	) {}

	execute(): string {
		const document = this.store.getDocument();
		const group = document.findById(this.groupId);
		if (!group) {
			return `error: no such shape: ${this.groupId}`;
		}

		if (!(group instanceof GroupShape)) {
			return `error: not a container: ${this.groupId}`;
		}

		this.undoState = {
			parent: document.findParentContainer(group),
			index: document.getShapeIndexInParent(
				group,
				document.findParentContainer(group),
			),
			children: [...group.getChildren()],
		};

		try {
			const promoted = document.ungroupContainer(this.groupId);
			return `g#${this.groupId} ungrouped (${promoted} shape promoted)`;
		} catch (error) {
			this.undoState = undefined;
			if (error instanceof Error) {
				return `error: ${error.message}`;
			}
			throw error;
		}
	}

	undo(): string {
		if (!this.undoState) {
			return "error: nothing to undo";
		}

		const document = this.store.getDocument();
		const { parent, index, children } = this.undoState;
		const group = new GroupShape(this.groupId);
		document.insertNewGroupAt(parent, index, group);

		for (const child of children) {
			document.reparentExistingShapeToContainer(this.groupId, child);
		}

		return `g#${this.groupId} restored with ${children.length} child`;
	}

	redo(): string {
		return this.execute();
	}
}

import { DocumentStore } from "../model/DocumentStore.js";
import { GroupShape } from "../model/GroupShape.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class UngroupCommand implements UndoableCommand {
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

		try {
			const promoted = document.ungroupContainer(this.groupId);
			return `g#${this.groupId} ungrouped (${promoted} shape promoted)`;
		} catch (error) {
			if (error instanceof Error) {
				return `error: ${error.message}`;
			}
			throw error;
		}
	}

	undo(): string {
		return "error: nothing to undo";
	}

	redo(): string {
		return "error: nothing to redo";
	}
}

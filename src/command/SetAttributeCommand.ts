import { DocumentStore } from "../model/DocumentStore.js";

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

		const result = shape.trySetAttribute(
			this.shapeId,
			this.attribute,
			this.value,
		);
		if (!result.ok) {
			return result.error;
		}
		this.previousValue = result.previousValue;
		return result.message;
	}

	undo(): string {
		if (this.previousValue === undefined) {
			return "error: nothing to undo";
		}

		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		const result = shape.trySetAttribute(
			this.shapeId,
			this.attribute,
			this.previousValue,
		);
		if (!result.ok) {
			return result.error;
		}
		return result.message;
	}

	redo(): string {
		return this.execute();
	}
}

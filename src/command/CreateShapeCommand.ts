import { RectShape } from "../model/RectShape.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";

import { INVALID_ARGUMENTS } from "./CommandMessages.js";

import type { EditorCommand } from "./EditorCommand.js";

export class CreateShapeCommand implements EditorCommand {
	constructor(
		private readonly store: DocumentStore,
		private readonly registry: ShapeRegistry,
		private readonly tokens: string[],
	) {}

	execute(): string {
		const type = this.tokens[0];
		if (!type) {
			return this.registry.unknownTypeMessage("");
		}

		if (!this.registry.isKnownType(type)) {
			return this.registry.unknownTypeMessage(type);
		}

		if (type === "rect") {
			return this.createRect();
		}

		return this.registry.unknownTypeMessage(type);
	}

	private createRect(): string {
		const [, id, xStr, yStr, wStr, hStr, fill] = this.tokens;
		if (!id || xStr === undefined || yStr === undefined || wStr === undefined || hStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		const rect = new RectShape(
			id,
			Number(xStr),
			Number(yStr),
			Number(wStr),
			Number(hStr),
			fill,
		);

		try {
			this.store.getDocument().addRootShape(rect);
		} catch (error) {
			if (error instanceof Error && error.message.startsWith("id already exists:")) {
				return `error: ${error.message}`;
			}
			throw error;
		}

		return `rect#${id} created`;
	}
}

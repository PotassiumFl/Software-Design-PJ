import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";
import type { Shape } from "../model/Shape.js";

import { INVALID_ARGUMENTS } from "./CommandMessages.js";

import type { UndoableCommand } from "./UndoableCommand.js";

type Placement = {
	shapeTokens: string[];
	containerId?: string;
};

export class CreateShapeCommand implements UndoableCommand {
	private created:
		| { shape: Shape; type: string; containerId?: string }
		| undefined;

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

		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const built = this.registry.createFromCliTokens(type, shapeTokens);
		if (built.error === "invalid_arguments" || !built.shape) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape(type, built.shape.id, built.shape, containerId);
	}

	private parsePlacement(tokens: string[]): Placement {
		const inIndex = tokens.lastIndexOf("in");
		if (inIndex === -1 || inIndex >= tokens.length - 1) {
			return { shapeTokens: tokens };
		}
		return {
			shapeTokens: tokens.slice(0, inIndex),
			containerId: tokens[inIndex + 1],
		};
	}

	undo(): string {
		if (!this.created) {
			return "error: nothing to undo";
		}
		const { shape, type } = this.created;
		this.store.getDocument().removeShape(shape.id);
		return `${type}#${shape.id} removed`;
	}

	redo(): string {
		if (!this.created) {
			return "error: nothing to redo";
		}
		return this.restoreCreated();
	}

	private placeShape(
		type: string,
		id: string,
		shape: Shape,
		containerId?: string,
	): string {
		try {
			const document = this.store.getDocument();
			if (containerId) {
				document.addShapeToContainer(containerId, shape);
				this.created = { shape, type, containerId };
				return `${type}#${id} created in g#${containerId}`;
			}
			document.addRootShape(shape);
			this.created = { shape, type };
		} catch (error) {
			return this.shapeError(error);
		}

		return `${type}#${id} created`;
	}

	private restoreCreated(): string {
		const created = this.created;
		if (!created) {
			return "error: nothing to redo";
		}
		const { shape, type, containerId } = created;
		try {
			const document = this.store.getDocument();
			if (containerId) {
				document.addShapeToContainer(containerId, shape);
				return `${type}#${shape.id} created in g#${containerId}`;
			}
			document.addRootShape(shape);
		} catch (error) {
			return this.shapeError(error);
		}
		return `${type}#${shape.id} created`;
	}

	private shapeError(error: unknown): string {
		if (error instanceof Error) {
			const { message } = error;
			if (
				message.startsWith("id already exists:") ||
				message.startsWith("no such container:") ||
				message.startsWith("not a container:")
			) {
				return `error: ${message}`;
			}
		}
		throw error;
	}
}

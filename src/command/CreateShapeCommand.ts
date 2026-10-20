import { CircleShape } from "../model/CircleShape.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { GroupShape } from "../model/GroupShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import { TextShape } from "../model/TextShape.js";
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

		switch (type) {
			case "rect":
				return this.createRect();
			case "circle":
				return this.createCircle();
			case "ellipse":
				return this.createEllipse();
			case "line":
				return this.createLine();
			case "text":
				return this.createText();
			case "g":
				return this.createGroup();
			default:
				return this.registry.unknownTypeMessage(type);
		}
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

	private createRect(): string {
		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const [, id, xStr, yStr, wStr, hStr, fill] = shapeTokens;
		if (!id || xStr === undefined || yStr === undefined || wStr === undefined || hStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape(
			"rect",
			id,
			new RectShape(id, Number(xStr), Number(yStr), Number(wStr), Number(hStr), fill),
			containerId,
		);
	}

	private createCircle(): string {
		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const [, id, cxStr, cyStr, rStr, fill] = shapeTokens;
		if (!id || cxStr === undefined || cyStr === undefined || rStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape(
			"circle",
			id,
			new CircleShape(id, Number(cxStr), Number(cyStr), Number(rStr), fill),
			containerId,
		);
	}

	private createEllipse(): string {
		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const [, id, cxStr, cyStr, rxStr, ryStr, fill] = shapeTokens;
		if (!id || cxStr === undefined || cyStr === undefined || rxStr === undefined || ryStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape(
			"ellipse",
			id,
			new EllipseShape(
				id,
				Number(cxStr),
				Number(cyStr),
				Number(rxStr),
				Number(ryStr),
				fill,
			),
			containerId,
		);
	}

	private createLine(): string {
		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const [, id, x1Str, y1Str, x2Str, y2Str, stroke] = shapeTokens;
		if (!id || x1Str === undefined || y1Str === undefined || x2Str === undefined || y2Str === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape(
			"line",
			id,
			new LineShape(
				id,
				Number(x1Str),
				Number(y1Str),
				Number(x2Str),
				Number(y2Str),
				stroke,
			),
			containerId,
		);
	}

	private createText(): string {
		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const [, id, xStr, yStr, content] = shapeTokens;
		if (!id || xStr === undefined || yStr === undefined || content === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape(
			"text",
			id,
			new TextShape(id, Number(xStr), Number(yStr), content),
			containerId,
		);
	}

	private createGroup(): string {
		const { shapeTokens, containerId } = this.parsePlacement(this.tokens);
		const [, id] = shapeTokens;
		if (!id) {
			return INVALID_ARGUMENTS;
		}

		return this.placeShape("g", id, new GroupShape(id), containerId);
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

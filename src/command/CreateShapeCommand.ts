import { CircleShape } from "../model/CircleShape.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import { TextShape } from "../model/TextShape.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";
import type { Shape } from "../model/Shape.js";

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
			default:
				return this.registry.unknownTypeMessage(type);
		}
	}

	private createRect(): string {
		const [, id, xStr, yStr, wStr, hStr, fill] = this.tokens;
		if (!id || xStr === undefined || yStr === undefined || wStr === undefined || hStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.addRoot(
			"rect",
			id,
			new RectShape(id, Number(xStr), Number(yStr), Number(wStr), Number(hStr), fill),
		);
	}

	private createCircle(): string {
		const [, id, cxStr, cyStr, rStr, fill] = this.tokens;
		if (!id || cxStr === undefined || cyStr === undefined || rStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.addRoot(
			"circle",
			id,
			new CircleShape(id, Number(cxStr), Number(cyStr), Number(rStr), fill),
		);
	}

	private createEllipse(): string {
		const [, id, cxStr, cyStr, rxStr, ryStr, fill] = this.tokens;
		if (!id || cxStr === undefined || cyStr === undefined || rxStr === undefined || ryStr === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.addRoot(
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
		);
	}

	private createLine(): string {
		const [, id, x1Str, y1Str, x2Str, y2Str, stroke] = this.tokens;
		if (!id || x1Str === undefined || y1Str === undefined || x2Str === undefined || y2Str === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.addRoot(
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
		);
	}

	private createText(): string {
		const [, id, xStr, yStr, content] = this.tokens;
		if (!id || xStr === undefined || yStr === undefined || content === undefined) {
			return INVALID_ARGUMENTS;
		}

		return this.addRoot(
			"text",
			id,
			new TextShape(id, Number(xStr), Number(yStr), content),
		);
	}

	private addRoot(type: string, id: string, shape: Shape): string {
		try {
			this.store.getDocument().addRootShape(shape);
		} catch (error) {
			if (error instanceof Error && error.message.startsWith("id already exists:")) {
				return `error: ${error.message}`;
			}
			throw error;
		}

		return `${type}#${id} created`;
	}
}

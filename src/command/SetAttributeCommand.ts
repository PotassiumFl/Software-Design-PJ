import { CircleShape } from "../model/CircleShape.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import { TextShape } from "../model/TextShape.js";
import { shapeTypeLabel } from "../model/ShapeTransform.js";
import type { Shape } from "../model/Shape.js";

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

		const result = this.apply(shape, this.attribute, this.value);
		if (result.startsWith("error:")) {
			return result;
		}
		return result;
	}

	undo(): string {
		if (this.previousValue === undefined) {
			return "error: nothing to undo";
		}

		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		return this.apply(shape, this.attribute, this.previousValue);
	}

	redo(): string {
		return this.execute();
	}

	private apply(shape: Shape, attribute: string, value: string): string {
		if (shape instanceof TextShape) {
			if (attribute === "text") {
				this.previousValue = shape.content;
				shape.content = value;
				return `${shapeTypeLabel(shape)}#${this.shapeId} updated: text="${value}"`;
			}
			if (attribute === "x" || attribute === "y") {
				return this.applyNumericField(shape, attribute, value, shape);
			}
		}

		if (shape instanceof RectShape) {
			if (attribute === "fill" || attribute === "stroke") {
				return this.applyStringField(shape, attribute, value, shape);
			}
			if (
				attribute === "x" ||
				attribute === "y" ||
				attribute === "width" ||
				attribute === "height"
			) {
				return this.applyNumericField(shape, attribute, value, shape);
			}
		}

		if (shape instanceof CircleShape) {
			if (attribute === "fill" || attribute === "stroke") {
				return this.applyStringField(shape, attribute, value, shape);
			}
			if (attribute === "cx" || attribute === "cy" || attribute === "r") {
				return this.applyNumericField(shape, attribute, value, shape);
			}
		}

		if (shape instanceof EllipseShape) {
			if (attribute === "fill" || attribute === "stroke") {
				return this.applyStringField(shape, attribute, value, shape);
			}
			if (
				attribute === "cx" ||
				attribute === "cy" ||
				attribute === "rx" ||
				attribute === "ry"
			) {
				return this.applyNumericField(shape, attribute, value, shape);
			}
		}

		if (shape instanceof LineShape) {
			if (attribute === "stroke") {
				return this.applyStringField(shape, attribute, value, shape);
			}
			if (attribute === "stroke-width") {
				return this.applyNumericField(
					shape,
					"strokeWidth",
					value,
					shape,
					"stroke-width",
				);
			}
			if (
				attribute === "x1" ||
				attribute === "y1" ||
				attribute === "x2" ||
				attribute === "y2"
			) {
				return this.applyNumericField(shape, attribute, value, shape);
			}
		}

		return `error: unknown attribute: ${attribute}`;
	}

	private applyStringField(
		shape: Shape,
		attribute: string,
		value: string,
		target: object,
	): string {
		const key =
			attribute === "stroke-width" ? "strokeWidth" : attribute;
		const record = target as Record<string, string | undefined>;
		this.previousValue = record[key];
		record[key] = value;
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} updated: ${attribute}=${value}`;
	}

	private applyNumericField(
		shape: Shape,
		field: string,
		value: string,
		target: object,
		displayAttribute?: string,
	): string {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			return `error: unknown attribute: ${displayAttribute ?? field}`;
		}

		const record = target as Record<string, number | string | undefined>;
		this.previousValue = String(record[field]);
		record[field] = parsed;
		const type = shapeTypeLabel(shape);
		const label = displayAttribute ?? field;
		return `${type}#${this.shapeId} updated: ${label}=${value}`;
	}
}

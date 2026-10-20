import { DocumentStore } from "../model/DocumentStore.js";
import { RectShape } from "../model/RectShape.js";
import { TextShape } from "../model/TextShape.js";
import { shapeTypeLabel } from "../model/ShapeTransform.js";

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

		if (shape instanceof TextShape && this.attribute === "text") {
			this.previousValue = shape.content;
			shape.content = this.value;
			const type = shapeTypeLabel(shape);
			return `${type}#${this.shapeId} updated: text="${this.value}"`;
		}

		if (shape instanceof RectShape) {
			return this.applyRectUpdate(shape);
		}

		return `error: unknown attribute: ${this.attribute}`;
	}

	undo(): string {
		if (this.previousValue === undefined) {
			return "error: nothing to undo";
		}

		const shape = this.store.getDocument().findById(this.shapeId);
		if (!shape) {
			return `error: no such shape: ${this.shapeId}`;
		}

		if (shape instanceof TextShape && this.attribute === "text") {
			shape.content = this.previousValue;
			const type = shapeTypeLabel(shape);
			return `${type}#${this.shapeId} updated: text="${this.previousValue}"`;
		}

		if (shape instanceof RectShape) {
			return this.restoreRectUpdate(shape);
		}

		return `error: unknown attribute: ${this.attribute}`;
	}

	redo(): string {
		return this.execute();
	}

	private applyRectUpdate(shape: RectShape): string {
		const field = this.rectField(this.attribute);
		if (!field) {
			return `error: unknown attribute: ${this.attribute}`;
		}

		const parsed = Number(this.value);
		if (!Number.isFinite(parsed)) {
			return `error: unknown attribute: ${this.attribute}`;
		}

		this.previousValue = String(shape[field]);
		shape[field] = parsed;
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} updated: ${this.attribute}=${this.value}`;
	}

	private restoreRectUpdate(shape: RectShape): string {
		const field = this.rectField(this.attribute);
		if (!field || this.previousValue === undefined) {
			return `error: unknown attribute: ${this.attribute}`;
		}

		shape[field] = Number(this.previousValue);
		const type = shapeTypeLabel(shape);
		return `${type}#${this.shapeId} updated: ${this.attribute}=${this.previousValue}`;
	}

	private rectField(
		attribute: string,
	): "x" | "y" | "width" | "height" | undefined {
		if (
			attribute === "x" ||
			attribute === "y" ||
			attribute === "width" ||
			attribute === "height"
		) {
			return attribute;
		}
		return undefined;
	}
}

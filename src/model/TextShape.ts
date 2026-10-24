import { PresentationStyle } from "./PresentationStyle.js";
import {
	type AttributeUpdateResult,
	Shape,
} from "./Shape.js";

export class TextShape extends Shape {
	constructor(
		id: string,
		x: number,
		y: number,
		content: string,
		fill?: string,
		stroke?: string,
		strokeWidth?: number,
	) {
		super(id);
		this._x = x;
		this._y = y;
		this._content = content;
		this.paint = new PresentationStyle(fill, stroke, strokeWidth);
	}

	private _x: number;
	private _y: number;
	private _content: string;
	private readonly paint: PresentationStyle;

	get x(): number {
		return this._x;
	}
	get y(): number {
		return this._y;
	}
	get content(): string {
		return this._content;
	}

	get fill(): string | undefined {
		return this.paint.fill;
	}

	get stroke(): string | undefined {
		return this.paint.stroke;
	}

	get strokeWidth(): number | undefined {
		return this.paint.strokeWidth;
	}

	typeLabel(): string {
		return "text";
	}

	translate(dx: number, dy: number): void {
		this._x += dx;
		this._y += dy;
	}

	scale(factor: number): void {
		this._x *= factor;
		this._y *= factor;
	}

	treeLabel(): string {
		return `text#${this.id}`;
	}

	treeAttributes(): string {
		return `(${this._x},${this._y}) "${this._content}"` + this.paint.treeSuffix();
	}

	showAttributeLines(): string[] {
		return [
			`  x=${this._x} y=${this._y}`,
			`  text=${this._content}`,
			...this.paint.showLines(),
		];
	}

	movePositionLabel(): string {
		return `(${this._x},${this._y})`;
	}

	serializeSvg(indent: string): string[] {
		return [
			`${indent}<text id="${this.id}" x="${this._x}" y="${this._y}"${this.paint.svgAttributes()}>${TextShape.escapeText(this._content)}</text>`,
		];
	}

	trySetAttribute(
		shapeId: string,
		attribute: string,
		value: string,
	): AttributeUpdateResult {
		const paint = this.paint.trySet(this.typeLabel(), shapeId, attribute, value);
		if (paint) {
			return paint;
		}
		if (attribute === "text") {
			const previousValue = this._content;
			this._content = value;
			return {
				ok: true,
				previousValue,
				message: `text#${shapeId} updated: text="${value}"`,
			};
		}
		if (attribute === "x" || attribute === "y") {
			return this.applyNumericAttribute(shapeId, attribute, value);
		}
		return { ok: false, error: `error: unknown attribute: ${attribute}` };
	}

	private applyNumericAttribute(
		shapeId: string,
		field: "x" | "y",
		value: string,
	): AttributeUpdateResult {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			return { ok: false, error: `error: unknown attribute: ${field}` };
		}
		const previousValue = String(field === "x" ? this._x : this._y);
		if (field === "x") {
			this._x = parsed;
		} else {
			this._y = parsed;
		}
		return {
			ok: true,
			previousValue,
			message: `text#${shapeId} updated: ${field}=${value}`,
		};
	}

	private static escapeText(content: string): string {
		return content
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
}

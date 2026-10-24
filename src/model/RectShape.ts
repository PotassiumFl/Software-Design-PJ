import { PresentationStyle } from "./PresentationStyle.js";
import {
	type AttributeUpdateResult,
	Shape,
} from "./Shape.js";

export class RectShape extends Shape {
	constructor(
		id: string,
		x: number,
		y: number,
		width: number,
		height: number,
		fill?: string,
		stroke?: string,
		strokeWidth?: number,
	) {
		super(id);
		this._x = x;
		this._y = y;
		this._width = width;
		this._height = height;
		this.paint = new PresentationStyle(fill, stroke, strokeWidth);
	}

	private _x: number;
	private _y: number;
	private _width: number;
	private _height: number;
	private readonly paint: PresentationStyle;

	get x(): number {
		return this._x;
	}
	get y(): number {
		return this._y;
	}
	get width(): number {
		return this._width;
	}
	get height(): number {
		return this._height;
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
		return "rect";
	}

	translate(dx: number, dy: number): void {
		this._x += dx;
		this._y += dy;
	}

	scale(factor: number): void {
		this._x *= factor;
		this._y *= factor;
		this._width *= factor;
		this._height *= factor;
	}

	treeLabel(): string {
		return `rect#${this.id}`;
	}

	treeAttributes(): string {
		const geometry = `x=${this._x} y=${this._y} w=${this._width} h=${this._height}`;
		return geometry + this.paint.treeSuffix();
	}

	showAttributeLines(): string[] {
		const geometry = `x=${this._x} y=${this._y} w=${this._width} h=${this._height}`;
		return [`  ${geometry}`, ...this.paint.showLines()];
	}

	movePositionLabel(): string {
		return `(${this._x},${this._y})`;
	}

	serializeSvg(indent: string): string[] {
		return [
			`${indent}<rect id="${this.id}" x="${this._x}" y="${this._y}" width="${this._width}" height="${this._height}"${this.paint.svgAttributes()}/>`,
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
		if (
			attribute === "x" ||
			attribute === "y" ||
			attribute === "width" ||
			attribute === "height"
		) {
			return this.applyNumericAttribute(shapeId, attribute, value);
		}
		return { ok: false, error: `error: unknown attribute: ${attribute}` };
	}

	private applyNumericAttribute(
		shapeId: string,
		field: "x" | "y" | "width" | "height",
		value: string,
	): AttributeUpdateResult {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			return { ok: false, error: `error: unknown attribute: ${field}` };
		}
		let previousValue: string;
		switch (field) {
			case "x":
				previousValue = String(this._x);
				this._x = parsed;
				break;
			case "y":
				previousValue = String(this._y);
				this._y = parsed;
				break;
			case "width":
				previousValue = String(this._width);
				this._width = parsed;
				break;
			case "height":
				previousValue = String(this._height);
				this._height = parsed;
				break;
		}
		return {
			ok: true,
			previousValue,
			message: `rect#${shapeId} updated: ${field}=${value}`,
		};
	}
}

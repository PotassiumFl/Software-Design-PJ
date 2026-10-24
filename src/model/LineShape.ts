import { PresentationStyle } from "./PresentationStyle.js";
import {
	type AttributeUpdateResult,
	Shape,
} from "./Shape.js";

export class LineShape extends Shape {
	constructor(
		id: string,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		stroke?: string,
		strokeWidth?: number,
		fill?: string,
	) {
		super(id);
		this._x1 = x1;
		this._y1 = y1;
		this._x2 = x2;
		this._y2 = y2;
		this.paint = new PresentationStyle(fill, stroke, strokeWidth);
	}

	private _x1: number;
	private _y1: number;
	private _x2: number;
	private _y2: number;
	private readonly paint: PresentationStyle;

	get x1(): number {
		return this._x1;
	}
	get y1(): number {
		return this._y1;
	}
	get x2(): number {
		return this._x2;
	}
	get y2(): number {
		return this._y2;
	}
	get stroke(): string | undefined {
		return this.paint.stroke;
	}
	get strokeWidth(): number | undefined {
		return this.paint.strokeWidth;
	}
	get fill(): string | undefined {
		return this.paint.fill;
	}

	typeLabel(): string {
		return "line";
	}

	translate(dx: number, dy: number): void {
		this._x1 += dx;
		this._y1 += dy;
		this._x2 += dx;
		this._y2 += dy;
	}

	scale(factor: number): void {
		this._x1 *= factor;
		this._y1 *= factor;
		this._x2 *= factor;
		this._y2 *= factor;
	}

	treeLabel(): string {
		return `line#${this.id}`;
	}

	treeAttributes(): string {
		const geometry = `(${this._x1},${this._y1}) -> (${this._x2},${this._y2})`;
		return geometry + this.paint.treeSuffix();
	}

	showAttributeLines(): string[] {
		const geometry = `x1=${this._x1} y1=${this._y1} x2=${this._x2} y2=${this._y2}`;
		return [`  ${geometry}`, ...this.paint.showLines()];
	}

	movePositionLabel(): string {
		return `(${this._x1},${this._y1})`;
	}

	serializeSvg(indent: string): string[] {
		return [
			`${indent}<line id="${this.id}" x1="${this._x1}" y1="${this._y1}" x2="${this._x2}" y2="${this._y2}"${this.paint.svgAttributes()}/>`,
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
			attribute === "x1" ||
			attribute === "y1" ||
			attribute === "x2" ||
			attribute === "y2"
		) {
			return this.applyNumericAttribute(shapeId, attribute, value);
		}
		return { ok: false, error: `error: unknown attribute: ${attribute}` };
	}

	private applyNumericAttribute(
		shapeId: string,
		field: "x1" | "y1" | "x2" | "y2",
		value: string,
	): AttributeUpdateResult {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			return { ok: false, error: `error: unknown attribute: ${field}` };
		}
		let previousValue: string;
		switch (field) {
			case "x1":
				previousValue = String(this._x1);
				this._x1 = parsed;
				break;
			case "y1":
				previousValue = String(this._y1);
				this._y1 = parsed;
				break;
			case "x2":
				previousValue = String(this._x2);
				this._x2 = parsed;
				break;
			case "y2":
				previousValue = String(this._y2);
				this._y2 = parsed;
				break;
		}
		return {
			ok: true,
			previousValue,
			message: `line#${shapeId} updated: ${field}=${value}`,
		};
	}
}

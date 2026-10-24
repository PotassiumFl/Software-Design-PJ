import { PresentationStyle } from "./PresentationStyle.js";
import {
	type AttributeUpdateResult,
	Shape,
} from "./Shape.js";

export class CircleShape extends Shape {
	constructor(
		id: string,
		cx: number,
		cy: number,
		r: number,
		fill?: string,
		stroke?: string,
		strokeWidth?: number,
	) {
		super(id);
		this._cx = cx;
		this._cy = cy;
		this._r = r;
		this.paint = new PresentationStyle(fill, stroke, strokeWidth);
	}

	private _cx: number;
	private _cy: number;
	private _r: number;
	private readonly paint: PresentationStyle;

	get cx(): number {
		return this._cx;
	}
	get cy(): number {
		return this._cy;
	}
	get r(): number {
		return this._r;
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
		return "circle";
	}

	translate(dx: number, dy: number): void {
		this._cx += dx;
		this._cy += dy;
	}

	scale(factor: number): void {
		this._cx *= factor;
		this._cy *= factor;
		this._r *= factor;
	}

	treeLabel(): string {
		return `circle#${this.id}`;
	}

	treeAttributes(): string {
		return `cx=${this._cx} cy=${this._cy} r=${this._r}` + this.paint.treeSuffix();
	}

	showAttributeLines(): string[] {
		return [
			`  cx=${this._cx} cy=${this._cy} r=${this._r}`,
			...this.paint.showLines(),
		];
	}

	movePositionLabel(): string {
		return `(${this._cx},${this._cy})`;
	}

	serializeSvg(indent: string): string[] {
		return [
			`${indent}<circle id="${this.id}" cx="${this._cx}" cy="${this._cy}" r="${this._r}"${this.paint.svgAttributes()}/>`,
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
		if (attribute === "cx" || attribute === "cy" || attribute === "r") {
			return this.applyNumericAttribute(shapeId, attribute, value);
		}
		return { ok: false, error: `error: unknown attribute: ${attribute}` };
	}

	private applyNumericAttribute(
		shapeId: string,
		field: "cx" | "cy" | "r",
		value: string,
	): AttributeUpdateResult {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			return { ok: false, error: `error: unknown attribute: ${field}` };
		}
		let previousValue: string;
		switch (field) {
			case "cx":
				previousValue = String(this._cx);
				this._cx = parsed;
				break;
			case "cy":
				previousValue = String(this._cy);
				this._cy = parsed;
				break;
			case "r":
				previousValue = String(this._r);
				this._r = parsed;
				break;
		}
		return {
			ok: true,
			previousValue,
			message: `circle#${shapeId} updated: ${field}=${value}`,
		};
	}
}

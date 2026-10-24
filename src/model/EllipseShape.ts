import { PresentationStyle } from "./PresentationStyle.js";
import {
	type AttributeUpdateResult,
	Shape,
} from "./Shape.js";

export class EllipseShape extends Shape {
	constructor(
		id: string,
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		fill?: string,
		stroke?: string,
		strokeWidth?: number,
	) {
		super(id);
		this._cx = cx;
		this._cy = cy;
		this._rx = rx;
		this._ry = ry;
		this.paint = new PresentationStyle(fill, stroke, strokeWidth);
	}

	private _cx: number;
	private _cy: number;
	private _rx: number;
	private _ry: number;
	private readonly paint: PresentationStyle;

	get cx(): number {
		return this._cx;
	}
	get cy(): number {
		return this._cy;
	}
	get rx(): number {
		return this._rx;
	}
	get ry(): number {
		return this._ry;
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
		return "ellipse";
	}

	translate(dx: number, dy: number): void {
		this._cx += dx;
		this._cy += dy;
	}

	scale(factor: number): void {
		this._cx *= factor;
		this._cy *= factor;
		this._rx *= factor;
		this._ry *= factor;
	}

	treeLabel(): string {
		return `ellipse#${this.id}`;
	}

	treeAttributes(): string {
		const geometry = `cx=${this._cx} cy=${this._cy} rx=${this._rx} ry=${this._ry}`;
		return geometry + this.paint.treeSuffix();
	}

	showAttributeLines(): string[] {
		const geometry = `cx=${this._cx} cy=${this._cy} rx=${this._rx} ry=${this._ry}`;
		return [`  ${geometry}`, ...this.paint.showLines()];
	}

	movePositionLabel(): string {
		return `(${this._cx},${this._cy})`;
	}

	serializeSvg(indent: string): string[] {
		return [
			`${indent}<ellipse id="${this.id}" cx="${this._cx}" cy="${this._cy}" rx="${this._rx}" ry="${this._ry}"${this.paint.svgAttributes()}/>`,
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
			attribute === "cx" ||
			attribute === "cy" ||
			attribute === "rx" ||
			attribute === "ry"
		) {
			return this.applyNumericAttribute(shapeId, attribute, value);
		}
		return { ok: false, error: `error: unknown attribute: ${attribute}` };
	}

	private applyNumericAttribute(
		shapeId: string,
		field: "cx" | "cy" | "rx" | "ry",
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
			case "rx":
				previousValue = String(this._rx);
				this._rx = parsed;
				break;
			case "ry":
				previousValue = String(this._ry);
				this._ry = parsed;
				break;
		}
		return {
			ok: true,
			previousValue,
			message: `ellipse#${shapeId} updated: ${field}=${value}`,
		};
	}
}

import { CircleShape } from "./CircleShape.js";
import { EllipseShape } from "./EllipseShape.js";
import { GroupShape } from "./GroupShape.js";
import { LineShape } from "./LineShape.js";
import { RectShape } from "./RectShape.js";
import type { Shape } from "./Shape.js";
import { TextShape } from "./TextShape.js";

/** 图形类型名分派（架构方案中的集中分派点之二） */
export class ShapeRegistry {
	private static readonly BUILTIN_TYPES = new Set([
		"rect",
		"circle",
		"ellipse",
		"line",
		"text",
		"g",
	]);

	isKnownType(type: string): boolean {
		return ShapeRegistry.BUILTIN_TYPES.has(type);
	}

	unknownTypeMessage(type: string): string {
		return `error: unknown shape type: ${type} (is the plugin loaded?)`;
	}

	createFromCliTokens(
		type: string,
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		switch (type) {
			case "rect":
				return this.createRect(shapeTokens);
			case "circle":
				return this.createCircle(shapeTokens);
			case "ellipse":
				return this.createEllipse(shapeTokens);
			case "line":
				return this.createLine(shapeTokens);
			case "text":
				return this.createText(shapeTokens);
			case "g":
				return this.createGroup(shapeTokens);
			default:
				return { error: "invalid_arguments" };
		}
	}

	createFromSvgTag(
		tag: string,
		id: string,
		attrs: SvgAttributeReader,
	): Shape | null {
		switch (tag) {
			case "rect":
				return new RectShape(
					id,
					attrs.number("x", 0),
					attrs.number("y", 0),
					attrs.number("width", 0),
					attrs.number("height", 0),
					attrs.optionalString("fill"),
					attrs.optionalString("stroke"),
					attrs.optionalNumber("stroke-width"),
				);
			case "circle":
				return new CircleShape(
					id,
					attrs.number("cx", 0),
					attrs.number("cy", 0),
					attrs.number("r", 0),
					attrs.optionalString("fill"),
					attrs.optionalString("stroke"),
					attrs.optionalNumber("stroke-width"),
				);
			case "ellipse":
				return new EllipseShape(
					id,
					attrs.number("cx", 0),
					attrs.number("cy", 0),
					attrs.number("rx", 0),
					attrs.number("ry", 0),
					attrs.optionalString("fill"),
					attrs.optionalString("stroke"),
					attrs.optionalNumber("stroke-width"),
				);
			case "line":
				return new LineShape(
					id,
					attrs.number("x1", 0),
					attrs.number("y1", 0),
					attrs.number("x2", 0),
					attrs.number("y2", 0),
					attrs.optionalString("stroke"),
					attrs.optionalNumber("stroke-width"),
					attrs.optionalString("fill"),
				);
			case "text":
				return new TextShape(
					id,
					attrs.number("x", 0),
					attrs.number("y", 0),
					attrs.textContent(),
					attrs.optionalString("fill"),
					attrs.optionalString("stroke"),
					attrs.optionalNumber("stroke-width"),
				);
			case "g":
				return new GroupShape(id);
			default:
				return null;
		}
	}

	private createRect(
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		const [, id, xStr, yStr, wStr, hStr, fill] = shapeTokens;
		if (
			!id ||
			xStr === undefined ||
			yStr === undefined ||
			wStr === undefined ||
			hStr === undefined
		) {
			return { error: "invalid_arguments" };
		}
		return {
			shape: new RectShape(
				id,
				Number(xStr),
				Number(yStr),
				Number(wStr),
				Number(hStr),
				fill,
			),
		};
	}

	private createCircle(
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		const [, id, cxStr, cyStr, rStr, fill] = shapeTokens;
		if (
			!id ||
			cxStr === undefined ||
			cyStr === undefined ||
			rStr === undefined
		) {
			return { error: "invalid_arguments" };
		}
		return {
			shape: new CircleShape(
				id,
				Number(cxStr),
				Number(cyStr),
				Number(rStr),
				fill,
			),
		};
	}

	private createEllipse(
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		const [, id, cxStr, cyStr, rxStr, ryStr, fill] = shapeTokens;
		if (
			!id ||
			cxStr === undefined ||
			cyStr === undefined ||
			rxStr === undefined ||
			ryStr === undefined
		) {
			return { error: "invalid_arguments" };
		}
		return {
			shape: new EllipseShape(
				id,
				Number(cxStr),
				Number(cyStr),
				Number(rxStr),
				Number(ryStr),
				fill,
			),
		};
	}

	private createLine(
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		const [, id, x1Str, y1Str, x2Str, y2Str, stroke] = shapeTokens;
		if (
			!id ||
			x1Str === undefined ||
			y1Str === undefined ||
			x2Str === undefined ||
			y2Str === undefined
		) {
			return { error: "invalid_arguments" };
		}
		return {
			shape: new LineShape(
				id,
				Number(x1Str),
				Number(y1Str),
				Number(x2Str),
				Number(y2Str),
				stroke,
			),
		};
	}

	private createText(
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		const [, id, xStr, yStr, content] = shapeTokens;
		if (
			!id ||
			xStr === undefined ||
			yStr === undefined ||
			content === undefined
		) {
			return { error: "invalid_arguments" };
		}
		return {
			shape: new TextShape(id, Number(xStr), Number(yStr), content),
		};
	}

	private createGroup(
		shapeTokens: string[],
	): { shape?: Shape; error?: "invalid_arguments" } {
		const [, id] = shapeTokens;
		if (!id) {
			return { error: "invalid_arguments" };
		}
		return { shape: new GroupShape(id) };
	}
}

/** SVG 属性读取，供 `createFromSvgTag` 使用，避免 IO 层按类型分派。 */
export type SvgAttributeReader = {
	number(name: string, defaultValue: number): number;
	optionalString(name: string): string | undefined;
	optionalNumber(name: string): number | undefined;
	textContent(): string;
};

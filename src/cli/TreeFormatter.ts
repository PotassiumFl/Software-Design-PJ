import { CircleShape } from "../model/CircleShape.js";
import { Document } from "../model/Document.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import { TextShape } from "../model/TextShape.js";
import type { Shape } from "../model/Shape.js";

export class TreeFormatter {
	static render(document: Document): string {
		const lines: string[] = [`svg (${document.width}x${document.height})`];
		for (const shape of document.getRootShapes()) {
			lines.push(TreeFormatter.formatShape(shape));
		}
		return lines.join("\n");
	}

	private static formatShape(shape: Shape): string {
		if (shape instanceof RectShape) {
			const parts = [
				`rect#${shape.id}`,
				`x=${shape.x} y=${shape.y} w=${shape.width} h=${shape.height}`,
			];
			if (shape.fill !== undefined) {
				parts.push(`fill=${shape.fill}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof CircleShape) {
			const parts = [
				`circle#${shape.id}`,
				`cx=${shape.cx} cy=${shape.cy} r=${shape.r}`,
			];
			if (shape.fill !== undefined) {
				parts.push(`fill=${shape.fill}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof EllipseShape) {
			const parts = [
				`ellipse#${shape.id}`,
				`cx=${shape.cx} cy=${shape.cy} rx=${shape.rx} ry=${shape.ry}`,
			];
			if (shape.fill !== undefined) {
				parts.push(`fill=${shape.fill}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof LineShape) {
			const parts = [
				`line#${shape.id}`,
				`(${shape.x1},${shape.y1}) -> (${shape.x2},${shape.y2})`,
			];
			if (shape.stroke !== undefined) {
				parts.push(`stroke=${shape.stroke}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof TextShape) {
			return `text#${shape.id} (${shape.x},${shape.y}) "${shape.content}"`;
		}

		return `${shape.id}`;
	}
}

import { CircleShape } from "../model/CircleShape.js";
import { Document } from "../model/Document.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { GroupShape } from "../model/GroupShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import { shapeTypeLabel } from "../model/ShapeTransform.js";
import type { Shape } from "../model/Shape.js";
import { TextShape } from "../model/TextShape.js";

export class ShowFormatter {
	static render(document: Document, shapeId: string): string {
		const shape = document.findById(shapeId);
		if (!shape) {
			return `error: no such shape: ${shapeId}`;
		}

		const parent = document.findParentContainer(shape);
		const parentLabel =
			parent === null ? "canvas" : `g#${parent.id}`;
		const lines: string[] = [
			`${shapeTypeLabel(shape)}#${shape.id}  parent=${parentLabel}`,
			...ShowFormatter.attributeLines(shape),
		];
		return lines.join("\n");
	}

	private static attributeLines(shape: Shape): string[] {
		if (shape instanceof GroupShape) {
			return [];
		}

		if (shape instanceof CircleShape) {
			const parts = [`cx=${shape.cx} cy=${shape.cy} r=${shape.r}`];
			const lines = [`  ${parts.join(" ")}`];
			if (shape.fill !== undefined) {
				lines.push(`  fill=${shape.fill}`);
			}
			return lines;
		}

		if (shape instanceof RectShape) {
			const parts = [
				`x=${shape.x} y=${shape.y} w=${shape.width} h=${shape.height}`,
			];
			const lines = [`  ${parts.join(" ")}`];
			if (shape.fill !== undefined) {
				lines.push(`  fill=${shape.fill}`);
			}
			return lines;
		}

		if (shape instanceof EllipseShape) {
			const parts = [
				`cx=${shape.cx} cy=${shape.cy} rx=${shape.rx} ry=${shape.ry}`,
			];
			const lines = [`  ${parts.join(" ")}`];
			if (shape.fill !== undefined) {
				lines.push(`  fill=${shape.fill}`);
			}
			return lines;
		}

		if (shape instanceof LineShape) {
			const parts = [
				`x1=${shape.x1} y1=${shape.y1} x2=${shape.x2} y2=${shape.y2}`,
			];
			const lines = [`  ${parts.join(" ")}`];
			if (shape.stroke !== undefined) {
				lines.push(`  stroke=${shape.stroke}`);
			}
			return lines;
		}

		if (shape instanceof TextShape) {
			return [
				`  x=${shape.x} y=${shape.y}`,
				`  text=${shape.content}`,
			];
		}

		return [];
	}
}

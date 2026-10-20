import { CircleShape } from "./CircleShape.js";
import { EllipseShape } from "./EllipseShape.js";
import { GroupShape } from "./GroupShape.js";
import { LineShape } from "./LineShape.js";
import { RectShape } from "./RectShape.js";
import type { Shape } from "./Shape.js";
import { TextShape } from "./TextShape.js";

export function translateShape(shape: Shape, dx: number, dy: number): void {
	if (shape instanceof GroupShape) {
		for (const child of shape.getChildren()) {
			translateShape(child, dx, dy);
		}
		return;
	}

	if (shape instanceof RectShape) {
		shape.x += dx;
		shape.y += dy;
		return;
	}

	if (shape instanceof CircleShape) {
		shape.cx += dx;
		shape.cy += dy;
		return;
	}

	if (shape instanceof EllipseShape) {
		shape.cx += dx;
		shape.cy += dy;
		return;
	}

	if (shape instanceof LineShape) {
		shape.x1 += dx;
		shape.y1 += dy;
		shape.x2 += dx;
		shape.y2 += dy;
		return;
	}

	if (shape instanceof TextShape) {
		shape.x += dx;
		shape.y += dy;
	}
}

export function shapeTypeLabel(shape: Shape): string {
	if (shape instanceof GroupShape) {
		return "g";
	}
	if (shape instanceof RectShape) {
		return "rect";
	}
	if (shape instanceof CircleShape) {
		return "circle";
	}
	if (shape instanceof EllipseShape) {
		return "ellipse";
	}
	if (shape instanceof LineShape) {
		return "line";
	}
	if (shape instanceof TextShape) {
		return "text";
	}
	return shape.id;
}

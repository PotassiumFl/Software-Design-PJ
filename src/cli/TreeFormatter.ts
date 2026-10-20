import { CircleShape } from "../model/CircleShape.js";
import { Document } from "../model/Document.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { GroupShape } from "../model/GroupShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import { TextShape } from "../model/TextShape.js";
import type { Shape } from "../model/Shape.js";

export class TreeFormatter {
	static render(document: Document, rootId?: string): string {
		if (rootId !== undefined) {
			const shape = document.findById(rootId);
			if (!shape) {
				return `error: no such shape: ${rootId}`;
			}
			const lines = [TreeFormatter.formatRootLine(shape)];
			if (shape instanceof GroupShape) {
				lines.push(
					...TreeFormatter.renderSiblingTrees(shape.getChildren(), ""),
				);
			}
			return lines.join("\n");
		}

		const lines: string[] = [`svg (${document.width}x${document.height})`];
		const roots = document.getRootShapes();
		lines.push(...TreeFormatter.renderSiblingTrees(roots, ""));
		return lines.join("\n");
	}

	private static renderSiblingTrees(
		shapes: readonly Shape[],
		prefix: string,
	): string[] {
		const labels = shapes.map((shape) => TreeFormatter.shapeLabel(shape));
		const width = Math.max(...labels.map((label) => label.length), 0);
		const lines: string[] = [];

		for (let i = 0; i < shapes.length; i++) {
			const shape = shapes[i]!;
			const isLast = i === shapes.length - 1;
			const connector = isLast ? "└── " : "├── ";
			const attrs = TreeFormatter.shapeAttributes(shape);
			const label = labels[i]!;
			const gap = Math.max(4, width - label.length + 1);
			const spacer = attrs ? " ".repeat(gap) : "";
			lines.push(`${prefix}${connector}${label}${spacer}${attrs}`);

			if (shape instanceof GroupShape) {
				const childPrefix = prefix + (isLast ? "    " : "│   ");
				lines.push(
					...TreeFormatter.renderSiblingTrees(
						shape.getChildren(),
						childPrefix,
					),
				);
			}
		}

		return lines;
	}

	private static formatRootLine(shape: Shape): string {
		const label = TreeFormatter.shapeLabel(shape);
		const attrs = TreeFormatter.shapeAttributes(shape);
		return attrs ? `${label}  ${attrs}` : label;
	}

	private static shapeLabel(shape: Shape): string {
		if (shape instanceof GroupShape) {
			return `g#${shape.id}`;
		}
		if (shape instanceof RectShape) {
			return `rect#${shape.id}`;
		}
		if (shape instanceof CircleShape) {
			return `circle#${shape.id}`;
		}
		if (shape instanceof EllipseShape) {
			return `ellipse#${shape.id}`;
		}
		if (shape instanceof LineShape) {
			return `line#${shape.id}`;
		}
		if (shape instanceof TextShape) {
			return `text#${shape.id}`;
		}
		return shape.id;
	}

	private static shapeAttributes(shape: Shape): string {
		if (shape instanceof GroupShape) {
			return "";
		}

		if (shape instanceof RectShape) {
			const parts = [
				`x=${shape.x} y=${shape.y} w=${shape.width} h=${shape.height}`,
			];
			if (shape.fill !== undefined) {
				parts.push(`fill=${shape.fill}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof CircleShape) {
			const parts = [
				`cx=${shape.cx} cy=${shape.cy} r=${shape.r}`,
			];
			if (shape.fill !== undefined) {
				parts.push(`fill=${shape.fill}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof EllipseShape) {
			const parts = [
				`cx=${shape.cx} cy=${shape.cy} rx=${shape.rx} ry=${shape.ry}`,
			];
			if (shape.fill !== undefined) {
				parts.push(`fill=${shape.fill}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof LineShape) {
			const parts = [
				`(${shape.x1},${shape.y1}) -> (${shape.x2},${shape.y2})`,
			];
			if (shape.stroke !== undefined) {
				parts.push(`stroke=${shape.stroke}`);
			}
			return parts.join(" ");
		}

		if (shape instanceof TextShape) {
			return `(${shape.x},${shape.y}) "${shape.content}"`;
		}

		return "";
	}
}

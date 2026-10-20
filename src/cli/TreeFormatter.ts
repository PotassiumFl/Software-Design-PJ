import { Document } from "../model/Document.js";
import { RectShape } from "../model/RectShape.js";
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
		return `${shape.id}`;
	}
}

import { Document } from "../model/Document.js";
import type { Shape } from "../model/Shape.js";

export class TreeFormatter {
	static render(document: Document, rootId?: string): string {
		if (rootId !== undefined) {
			const shape = document.findById(rootId);
			if (!shape) {
				return `error: no such shape: ${rootId}`;
			}
			const lines = [TreeFormatter.formatRootLine(shape)];
			if (shape.isComposite()) {
				lines.push(
					...TreeFormatter.renderSiblingTrees(
						shape.getChildShapes(),
						"",
					),
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
		const labels = shapes.map((shape) => shape.treeLabel());
		const width = Math.max(...labels.map((label) => label.length), 0);
		const lines: string[] = [];

		for (let i = 0; i < shapes.length; i++) {
			const shape = shapes[i]!;
			const isLast = i === shapes.length - 1;
			const connector = isLast ? "└── " : "├── ";
			const attrs = shape.treeAttributes();
			const label = labels[i]!;
			const gap = Math.max(4, width - label.length + 1);
			const spacer = attrs ? " ".repeat(gap) : "";
			lines.push(`${prefix}${connector}${label}${spacer}${attrs}`);

			if (shape.isComposite()) {
				const childPrefix = prefix + (isLast ? "    " : "│   ");
				lines.push(
					...TreeFormatter.renderSiblingTrees(
						shape.getChildShapes(),
						childPrefix,
					),
				);
			}
		}

		return lines;
	}

	private static formatRootLine(shape: Shape): string {
		const label = shape.treeLabel();
		const attrs = shape.treeAttributes();
		return attrs ? `${label}  ${attrs}` : label;
	}
}

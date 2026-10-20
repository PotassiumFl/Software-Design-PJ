import { Document } from "../model/Document.js";
import { GroupShape } from "../model/GroupShape.js";
import type { Shape } from "../model/Shape.js";

export function countDocumentElements(document: Document): number {
	let count = 0;

	const visit = (shape: Shape): void => {
		count += 1;
		if (shape instanceof GroupShape) {
			for (const child of shape.getChildren()) {
				visit(child);
			}
		}
	};

	for (const root of document.getRootShapes()) {
		visit(root);
	}

	return count;
}

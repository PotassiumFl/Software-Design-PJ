import { Document } from "../model/Document.js";

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
			`${shape.typeLabel()}#${shape.id}  parent=${parentLabel}`,
			...shape.showAttributeLines(),
		];
		return lines.join("\n");
	}
}

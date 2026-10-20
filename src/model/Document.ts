import type { Shape } from "./Shape.js";

export class Document {
	private readonly rootShapes: Shape[] = [];
	private readonly shapesById = new Map<string, Shape>();

	constructor(
		public readonly width: number,
		public readonly height: number,
	) {}

	getRootShapes(): readonly Shape[] {
		return this.rootShapes;
	}

	findById(id: string): Shape | undefined {
		return this.shapesById.get(id);
	}

	addRootShape(shape: Shape): void {
		if (this.shapesById.has(shape.id)) {
			throw new Error(`id already exists: ${shape.id}`);
		}
		this.shapesById.set(shape.id, shape);
		this.rootShapes.push(shape);
	}
}


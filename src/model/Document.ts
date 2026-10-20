import { GroupShape } from "./GroupShape.js";
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
		this.registerShape(shape);
		this.rootShapes.push(shape);
	}

	addShapeToContainer(containerId: string, shape: Shape): void {
		const container = this.shapesById.get(containerId);
		if (!container) {
			throw new Error(`no such container: ${containerId}`);
		}
		if (!(container instanceof GroupShape)) {
			throw new Error(`not a container: ${containerId}`);
		}
		this.registerShape(shape);
		container.addChild(shape);
	}

	private registerShape(shape: Shape): void {
		if (this.shapesById.has(shape.id)) {
			throw new Error(`id already exists: ${shape.id}`);
		}
		this.shapesById.set(shape.id, shape);
	}
}


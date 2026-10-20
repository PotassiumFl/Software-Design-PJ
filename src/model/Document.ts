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

	removeShape(id: string): void {
		const shape = this.shapesById.get(id);
		if (!shape) {
			throw new Error(`no such shape: ${id}`);
		}
		this.detachShape(shape);
		this.unregisterShapeRecursive(shape);
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

	private detachShape(shape: Shape): void {
		const rootIndex = this.rootShapes.indexOf(shape);
		if (rootIndex >= 0) {
			this.rootShapes.splice(rootIndex, 1);
			return;
		}

		for (const root of this.rootShapes) {
			if (root instanceof GroupShape && this.detachFromGroup(root, shape)) {
				return;
			}
		}
	}

	private detachFromGroup(group: GroupShape, target: Shape): boolean {
		if (group.getChildren().includes(target)) {
			group.removeChild(target);
			return true;
		}

		for (const child of group.getChildren()) {
			if (child instanceof GroupShape && this.detachFromGroup(child, target)) {
				return true;
			}
		}

		return false;
	}

	private unregisterShapeRecursive(shape: Shape): void {
		if (shape instanceof GroupShape) {
			for (const child of [...shape.getChildren()]) {
				this.unregisterShapeRecursive(child);
			}
		}
		this.shapesById.delete(shape.id);
	}
}


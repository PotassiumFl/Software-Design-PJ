import { GroupShape } from "./GroupShape.js";
import type { Shape } from "./Shape.js";

export class Document {
	private readonly rootShapes: Shape[] = [];
	private readonly shapesById = new Map<string, Shape>();

	constructor(
		public width: number,
		public height: number,
	) {}

	resizeCanvas(width: number, height: number): void {
		this.width = width;
		this.height = height;
	}

	moveShapeToFront(shapeId: string): number {
		const shape = this.shapesById.get(shapeId);
		if (!shape) {
			throw new Error(`no such shape: ${shapeId}`);
		}
		const parent = this.findParentContainer(shape);
		const previousIndex = this.getShapeIndexInParent(shape, parent);
		this.detachShape(shape);
		if (parent === null) {
			this.rootShapes.push(shape);
		} else {
			parent.addChild(shape);
		}
		return previousIndex;
	}

	moveShapeToBack(shapeId: string): number {
		const shape = this.shapesById.get(shapeId);
		if (!shape) {
			throw new Error(`no such shape: ${shapeId}`);
		}
		const parent = this.findParentContainer(shape);
		const previousIndex = this.getShapeIndexInParent(shape, parent);
		this.detachShape(shape);
		if (parent === null) {
			this.rootShapes.unshift(shape);
		} else {
			parent.insertChildAt(0, shape);
		}
		return previousIndex;
	}

	reinsertShapeAt(
		shape: Shape,
		parent: GroupShape | null,
		index: number,
	): void {
		this.detachShape(shape);
		if (parent === null) {
			this.rootShapes.splice(index, 0, shape);
			return;
		}
		parent.insertChildAt(index, shape);
	}

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

	findParentContainer(shape: Shape): GroupShape | null {
		for (const root of this.rootShapes) {
			if (root === shape) {
				return null;
			}
			if (root instanceof GroupShape) {
				const parent = this.findParentInGroup(root, shape);
				if (parent !== undefined) {
					return parent;
				}
			}
		}
		throw new Error(`no such shape: ${shape.id}`);
	}

	getShapeIndexInParent(shape: Shape, parent: GroupShape | null): number {
		if (parent === null) {
			return this.rootShapes.indexOf(shape);
		}
		return parent.getChildren().indexOf(shape);
	}

	restoreDeletedShape(
		shape: Shape,
		parent: GroupShape | null,
		index: number,
	): void {
		this.registerShape(shape);
		if (parent === null) {
			this.rootShapes.splice(index, 0, shape);
			return;
		}
		parent.insertChildAt(index, shape);
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

	insertRootShapeAt(index: number, shape: Shape): void {
		this.registerShape(shape);
		this.rootShapes.splice(index, 0, shape);
	}

	getRootIndex(shape: Shape): number {
		return this.rootShapes.indexOf(shape);
	}

	isDescendantOf(ancestorId: string, descendantId: string): boolean {
		const ancestor = this.shapesById.get(ancestorId);
		if (!(ancestor instanceof GroupShape)) {
			return false;
		}
		return this.containsShapeId(ancestor, descendantId);
	}

	reparentExistingShapeToContainer(
		containerId: string,
		shape: Shape,
	): void {
		const container = this.shapesById.get(containerId);
		if (!container) {
			throw new Error(`no such container: ${containerId}`);
		}
		if (!(container instanceof GroupShape)) {
			throw new Error(`not a container: ${containerId}`);
		}
		this.detachShape(shape);
		container.addChild(shape);
	}

	ungroupContainer(groupId: string): number {
		const group = this.shapesById.get(groupId);
		if (!group) {
			throw new Error(`no such shape: ${groupId}`);
		}
		if (!(group instanceof GroupShape)) {
			throw new Error(`not a container: ${groupId}`);
		}

		const parent = this.findParentContainer(group);
		if (parent === null) {
			throw new Error(`cannot ungroup top-level container: ${groupId}`);
		}

		const index = parent.getChildren().indexOf(group);
		const children = [...group.getChildren()];
		parent.removeChild(group);
		for (let i = 0; i < children.length; i++) {
			parent.insertChildAt(index + i, children[i]!);
		}
		this.shapesById.delete(group.id);
		return children.length;
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

	private containsShapeId(group: GroupShape, shapeId: string): boolean {
		for (const child of group.getChildren()) {
			if (child.id === shapeId) {
				return true;
			}
			if (child instanceof GroupShape && this.containsShapeId(child, shapeId)) {
				return true;
			}
		}
		return false;
	}

	private findParentInGroup(
		group: GroupShape,
		target: Shape,
	): GroupShape | null | undefined {
		if (group.getChildren().includes(target)) {
			return group;
		}
		for (const child of group.getChildren()) {
			if (child instanceof GroupShape) {
				const parent = this.findParentInGroup(child, target);
				if (parent !== undefined) {
					return parent;
				}
			}
		}
		return undefined;
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


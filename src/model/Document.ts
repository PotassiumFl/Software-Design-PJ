import type { Shape } from "./Shape.js";

export class Document {
	private readonly rootShapes: Shape[] = [];
	private readonly shapesById = new Map<string, Shape>();
	private _width: number;
	private _height: number;

	constructor(width: number, height: number) {
		this._width = width;
		this._height = height;
	}

	get width(): number {
		return this._width;
	}

	get height(): number {
		return this._height;
	}

	resizeCanvas(width: number, height: number): void {
		this._width = width;
		this._height = height;
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

	reinsertShapeAt(shape: Shape, parent: Shape | null, index: number): void {
		this.detachShape(shape);
		if (parent === null) {
			this.rootShapes.splice(index, 0, shape);
			return;
		}
		parent.insertChildAt(index, shape);
	}

	insertNewGroupAt(parent: Shape | null, index: number, group: Shape): void {
		this.registerShape(group);
		if (parent === null) {
			this.rootShapes.splice(index, 0, group);
			return;
		}
		parent.insertChildAt(index, group);
	}

	removeGroupContainer(groupId: string): void {
		const group = this.shapesById.get(groupId);
		if (!group || !group.isComposite()) {
			throw new Error(`no such shape: ${groupId}`);
		}
		if (group.getChildShapes().length > 0) {
			throw new Error(`not empty: ${groupId}`);
		}
		this.detachShape(group);
		this.shapesById.delete(groupId);
	}

	getRootShapes(): readonly Shape[] {
		return this.rootShapes;
	}

	countElements(): number {
		let count = 0;
		const visit = (shape: Shape): void => {
			count += 1;
			for (const child of shape.getChildShapes()) {
				visit(child);
			}
		};
		for (const root of this.rootShapes) {
			visit(root);
		}
		return count;
	}

	findById(id: string): Shape | undefined {
		return this.shapesById.get(id);
	}

	addRootShape(shape: Shape): void {
		this.registerShapeTree(shape);
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

	findParentContainer(shape: Shape): Shape | null {
		for (const root of this.rootShapes) {
			if (root === shape) {
				return null;
			}
			if (root.isComposite()) {
				const parent = this.findParentInGroup(root, shape);
				if (parent !== undefined) {
					return parent;
				}
			}
		}
		throw new Error(`no such shape: ${shape.id}`);
	}

	getShapeIndexInParent(shape: Shape, parent: Shape | null): number {
		if (parent === null) {
			return this.rootShapes.indexOf(shape);
		}
		return parent.indexOfChild(shape);
	}

	restoreDeletedShape(
		shape: Shape,
		parent: Shape | null,
		index: number,
	): void {
		this.registerShapeTree(shape);
		if (parent === null) {
			this.rootShapes.splice(index, 0, shape);
			return;
		}
		parent.insertChildAt(index, shape);
	}

	addShapeToContainer(containerId: string, shape: Shape): void {
		const container = this.requireContainer(containerId);
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
		if (!ancestor || !ancestor.isComposite()) {
			return false;
		}
		return this.containsShapeId(ancestor, descendantId);
	}

	reparentExistingShapeToContainer(containerId: string, shape: Shape): void {
		const container = this.requireContainer(containerId);
		this.detachShape(shape);
		container.addChild(shape);
	}

	ungroupContainer(groupId: string): number {
		const group = this.shapesById.get(groupId);
		if (!group) {
			throw new Error(`no such shape: ${groupId}`);
		}
		if (!group.isComposite()) {
			throw new Error(`not a container: ${groupId}`);
		}

		const parent = this.findParentContainer(group);
		if (parent === null) {
			throw new Error(`cannot ungroup top-level container: ${groupId}`);
		}

		const index = parent.indexOfChild(group);
		const children = [...group.getChildShapes()];
		parent.removeChild(group);
		for (let i = 0; i < children.length; i++) {
			parent.insertChildAt(index + i, children[i]!);
		}
		this.shapesById.delete(group.id);
		return children.length;
	}

	private requireContainer(containerId: string): Shape {
		const container = this.shapesById.get(containerId);
		if (!container) {
			throw new Error(`no such container: ${containerId}`);
		}
		if (!container.isComposite()) {
			throw new Error(`not a container: ${containerId}`);
		}
		return container;
	}

	private registerShape(shape: Shape): void {
		if (this.shapesById.has(shape.id)) {
			throw new Error(`id already exists: ${shape.id}`);
		}
		this.shapesById.set(shape.id, shape);
	}

	private registerShapeTree(shape: Shape): void {
		this.registerShape(shape);
		for (const child of shape.getChildShapes()) {
			this.registerShapeTree(child);
		}
	}

	private detachShape(shape: Shape): void {
		const rootIndex = this.rootShapes.indexOf(shape);
		if (rootIndex >= 0) {
			this.rootShapes.splice(rootIndex, 1);
			return;
		}

		for (const root of this.rootShapes) {
			if (root.isComposite() && this.detachFromGroup(root, shape)) {
				return;
			}
		}
	}

	private detachFromGroup(group: Shape, target: Shape): boolean {
		if (group.getChildShapes().includes(target)) {
			group.removeChild(target);
			return true;
		}

		for (const child of group.getChildShapes()) {
			if (child.isComposite() && this.detachFromGroup(child, target)) {
				return true;
			}
		}

		return false;
	}

	private containsShapeId(group: Shape, shapeId: string): boolean {
		for (const child of group.getChildShapes()) {
			if (child.id === shapeId) {
				return true;
			}
			if (child.isComposite() && this.containsShapeId(child, shapeId)) {
				return true;
			}
		}
		return false;
	}

	private findParentInGroup(
		group: Shape,
		target: Shape,
	): Shape | null | undefined {
		if (group.getChildShapes().includes(target)) {
			return group;
		}
		for (const child of group.getChildShapes()) {
			if (child.isComposite()) {
				const parent = this.findParentInGroup(child, target);
				if (parent !== undefined) {
					return parent;
				}
			}
		}
		return undefined;
	}

	private unregisterShapeRecursive(shape: Shape): void {
		for (const child of [...shape.getChildShapes()]) {
			this.unregisterShapeRecursive(child);
		}
		this.shapesById.delete(shape.id);
	}
}

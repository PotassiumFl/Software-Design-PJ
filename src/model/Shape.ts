export type AttributeUpdateResult =
	| { ok: true; message: string; previousValue: string }
	| { ok: false; error: string };

export abstract class Shape {
	constructor(public readonly id: string) {}

	abstract typeLabel(): string;

	abstract translate(dx: number, dy: number): void;

	abstract scale(factor: number): void;

	abstract treeLabel(): string;

	abstract treeAttributes(): string;

	abstract showAttributeLines(): string[];

	/** Absolute anchor for leaf move feedback, e.g. `(130,26)`. */
	abstract movePositionLabel(): string;

	abstract serializeSvg(indent: string): string[];

	abstract trySetAttribute(
		shapeId: string,
		attribute: string,
		value: string,
	): AttributeUpdateResult;

	isComposite(): boolean {
		return false;
	}

	getChildShapes(): readonly Shape[] {
		return [];
	}

	indexOfChild(shape: Shape): number {
		return this.getChildShapes().indexOf(shape);
	}

	addChild(_shape: Shape): void {
		throw new Error("not a container");
	}

	removeChild(_shape: Shape): void {
		throw new Error("not a container");
	}

	insertChildAt(_index: number, _shape: Shape): void {
		throw new Error("not a container");
	}
}

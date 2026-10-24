import {
	type AttributeUpdateResult,
	Shape,
} from "./Shape.js";

export class GroupShape extends Shape {
	private readonly children: Shape[] = [];

	getChildren(): readonly Shape[] {
		return this.children;
	}

	addChild(shape: Shape): void {
		this.children.push(shape);
	}

	removeChild(shape: Shape): void {
		const index = this.children.indexOf(shape);
		if (index >= 0) {
			this.children.splice(index, 1);
		}
	}

	insertChildAt(index: number, shape: Shape): void {
		this.children.splice(index, 0, shape);
	}

	isComposite(): boolean {
		return true;
	}

	getChildShapes(): readonly Shape[] {
		return this.children;
	}

	typeLabel(): string {
		return "g";
	}

	translate(dx: number, dy: number): void {
		for (const child of this.children) {
			child.translate(dx, dy);
		}
	}

	scale(factor: number): void {
		for (const child of this.children) {
			child.scale(factor);
		}
	}

	treeLabel(): string {
		return `g#${this.id}`;
	}

	treeAttributes(): string {
		return "";
	}

	showAttributeLines(): string[] {
		return [];
	}

	movePositionLabel(): string {
		return "(0,0)";
	}

	serializeSvg(indent: string): string[] {
		const lines = [`${indent}<g id="${this.id}">`];
		for (const child of this.children) {
			lines.push(...child.serializeSvg(`${indent}  `));
		}
		lines.push(`${indent}</g>`);
		return lines;
	}

	trySetAttribute(
		_shapeId: string,
		attribute: string,
		_value: string,
	): AttributeUpdateResult {
		return { ok: false, error: `error: unknown attribute: ${attribute}` };
	}
}

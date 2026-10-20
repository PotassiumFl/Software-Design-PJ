import { Shape } from "./Shape.js";

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
}

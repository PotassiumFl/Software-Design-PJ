import { Shape } from "./Shape.js";

export class GroupShape extends Shape {
	private readonly children: Shape[] = [];

	getChildren(): readonly Shape[] {
		return this.children;
	}

	addChild(shape: Shape): void {
		this.children.push(shape);
	}
}

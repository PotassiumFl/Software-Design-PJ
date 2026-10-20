import { Shape } from "./Shape.js";

export class TextShape extends Shape {
	constructor(
		id: string,
		public x: number,
		public y: number,
		public readonly content: string,
	) {
		super(id);
	}
}

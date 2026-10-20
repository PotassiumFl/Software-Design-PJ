import { Shape } from "./Shape.js";

export class TextShape extends Shape {
	constructor(
		id: string,
		public readonly x: number,
		public readonly y: number,
		public readonly content: string,
	) {
		super(id);
	}
}

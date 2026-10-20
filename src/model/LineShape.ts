import { Shape } from "./Shape.js";

export class LineShape extends Shape {
	constructor(
		id: string,
		public readonly x1: number,
		public readonly y1: number,
		public readonly x2: number,
		public readonly y2: number,
		public readonly stroke?: string,
	) {
		super(id);
	}
}

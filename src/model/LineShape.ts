import { Shape } from "./Shape.js";

export class LineShape extends Shape {
	constructor(
		id: string,
		public x1: number,
		public y1: number,
		public x2: number,
		public y2: number,
		public stroke?: string,
		public strokeWidth?: number,
	) {
		super(id);
	}
}

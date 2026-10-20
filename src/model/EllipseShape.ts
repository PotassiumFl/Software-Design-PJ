import { Shape } from "./Shape.js";

export class EllipseShape extends Shape {
	constructor(
		id: string,
		public cx: number,
		public cy: number,
		public readonly rx: number,
		public readonly ry: number,
		public readonly fill?: string,
	) {
		super(id);
	}
}

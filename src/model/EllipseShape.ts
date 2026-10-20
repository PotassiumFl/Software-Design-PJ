import { Shape } from "./Shape.js";

export class EllipseShape extends Shape {
	constructor(
		id: string,
		public cx: number,
		public cy: number,
		public rx: number,
		public ry: number,
		public readonly fill?: string,
	) {
		super(id);
	}
}

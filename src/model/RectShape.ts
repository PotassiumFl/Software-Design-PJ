import { Shape } from "./Shape.js";

export class RectShape extends Shape {
	constructor(
		id: string,
		public x: number,
		public y: number,
		public readonly width: number,
		public readonly height: number,
		public readonly fill?: string,
	) {
		super(id);
	}
}

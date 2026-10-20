import { Shape } from "./Shape.js";

export class CircleShape extends Shape {
	constructor(
		id: string,
		public cx: number,
		public cy: number,
		public readonly r: number,
		public readonly fill?: string,
	) {
		super(id);
	}
}

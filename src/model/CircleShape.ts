import { Shape } from "./Shape.js";

export class CircleShape extends Shape {
	constructor(
		id: string,
		public readonly cx: number,
		public readonly cy: number,
		public readonly r: number,
		public readonly fill?: string,
	) {
		super(id);
	}
}

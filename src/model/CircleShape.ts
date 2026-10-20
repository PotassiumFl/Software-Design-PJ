import { Shape } from "./Shape.js";

export class CircleShape extends Shape {
	constructor(
		id: string,
		public cx: number,
		public cy: number,
		public r: number,
		public readonly fill?: string,
	) {
		super(id);
	}
}

import type { Shape } from "../model/Shape.js";

/** Plugin hook for composite / extended shape types (e.g. box in a later phase). */
export interface ShapeProvider {
	readonly typeName: string;
	create(tokens: string[]): ShapeProviderCreateResult;
}

export type ShapeProviderCreateResult =
	| { ok: true; shape: Shape }
	| { ok: false; message: string };

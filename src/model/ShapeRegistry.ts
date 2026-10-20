/** 图形类型名 → 是否内置（待重构：集中分派点之二） */
export class ShapeRegistry {
	isKnownType(type: string): boolean {
		return type === "rect";
	}

	unknownTypeMessage(type: string): string {
		return `error: unknown shape type: ${type} (is the plugin loaded?)`;
	}
}

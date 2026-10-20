/** 图形类型名 → 是否内置（待重构：集中分派点之二） */
export class ShapeRegistry {
	private static readonly BUILTIN_TYPES = new Set([
		"rect",
		"circle",
		"ellipse",
		"line",
		"text",
	]);

	isKnownType(type: string): boolean {
		return ShapeRegistry.BUILTIN_TYPES.has(type);
	}

	unknownTypeMessage(type: string): string {
		return `error: unknown shape type: ${type} (is the plugin loaded?)`;
	}
}

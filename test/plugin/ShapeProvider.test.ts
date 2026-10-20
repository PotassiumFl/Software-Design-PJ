import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ShapeProvider } from "../../src/plugin/ShapeProvider.js";
import { ShapeRegistry } from "../../src/model/ShapeRegistry.js";

describe("ShapeProvider (G S25)", () => {
	it("defines a hook for registering composite shape types", () => {
		const provider: ShapeProvider = {
			typeName: "box",
			create(_tokens: string[]) {
				return { ok: false as const, message: "not implemented in lab1" };
			},
		};

		assert.equal(provider.typeName, "box");
	});

	it("keeps box out of builtin registry until a plugin loads it", () => {
		const registry = new ShapeRegistry();

		assert.equal(registry.isKnownType("box"), false);
		assert.equal(
			registry.unknownTypeMessage("box"),
			"error: unknown shape type: box (is the plugin loaded?)",
		);
	});
});

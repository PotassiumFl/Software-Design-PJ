import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ShapeRegistry } from "../../src/model/ShapeRegistry.js";

describe("ShapeRegistry", () => {
	const BUILTIN_TYPES = ["rect", "circle", "ellipse", "line", "text"] as const;

	for (const type of BUILTIN_TYPES) {
		it(`registers builtin type ${type}`, () => {
			const registry = new ShapeRegistry();
			assert.equal(registry.isKnownType(type), true);
		});
	}

	it("rejects unknown types with assignment message", () => {
		const registry = new ShapeRegistry();
		assert.equal(
			registry.unknownTypeMessage("box"),
			"error: unknown shape type: box (is the plugin loaded?)",
		);
	});
});

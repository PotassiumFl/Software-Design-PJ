import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ShapeRegistry } from "../../src/model/ShapeRegistry.js";

describe("ShapeRegistry", () => {
	it("registers rect in phase C", () => {
		const registry = new ShapeRegistry();
		assert.equal(registry.isKnownType("rect"), true);
	});

	it("rejects unknown types with assignment message", () => {
		const registry = new ShapeRegistry();
		assert.equal(
			registry.unknownTypeMessage("box"),
			"error: unknown shape type: box (is the plugin loaded?)",
		);
	});
});

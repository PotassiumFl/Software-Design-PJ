import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { RectShape } from "../../src/model/RectShape.js";

describe("RectShape", () => {
	it("exposes geometry and optional fill", () => {
		const rect = new RectShape("r1", 10, 20, 100, 50, "#eee");
		assert.equal(rect.id, "r1");
		assert.equal(rect.x, 10);
		assert.equal(rect.y, 20);
		assert.equal(rect.width, 100);
		assert.equal(rect.height, 50);
		assert.equal(rect.fill, "#eee");
	});

	it("omits fill when not provided", () => {
		const rect = new RectShape("r2", 0, 0, 1, 1);
		assert.equal(rect.fill, undefined);
	});
});

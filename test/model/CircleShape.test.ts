import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CircleShape } from "../../src/model/CircleShape.js";

describe("CircleShape", () => {
	it("exposes center, radius, and optional fill", () => {
		const circle = new CircleShape("c1", 100, 100, 20, "red");
		assert.equal(circle.id, "c1");
		assert.equal(circle.cx, 100);
		assert.equal(circle.cy, 100);
		assert.equal(circle.r, 20);
		assert.equal(circle.fill, "red");
	});

	it("omits fill when not provided", () => {
		const circle = new CircleShape("c2", 0, 0, 1);
		assert.equal(circle.fill, undefined);
	});
});

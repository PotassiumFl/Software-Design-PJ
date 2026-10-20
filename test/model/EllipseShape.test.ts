import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EllipseShape } from "../../src/model/EllipseShape.js";

describe("EllipseShape", () => {
	it("exposes center, radii, and optional fill", () => {
		const ellipse = new EllipseShape("e1", 1, 2, 3, 4, "#abc");
		assert.equal(ellipse.id, "e1");
		assert.equal(ellipse.cx, 1);
		assert.equal(ellipse.cy, 2);
		assert.equal(ellipse.rx, 3);
		assert.equal(ellipse.ry, 4);
		assert.equal(ellipse.fill, "#abc");
	});
});

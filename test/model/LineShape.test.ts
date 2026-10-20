import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LineShape } from "../../src/model/LineShape.js";

describe("LineShape", () => {
	it("exposes endpoints and optional stroke", () => {
		const line = new LineShape("arrow1", 280, 130, 520, 130, "black");
		assert.equal(line.id, "arrow1");
		assert.equal(line.x1, 280);
		assert.equal(line.y1, 130);
		assert.equal(line.x2, 520);
		assert.equal(line.y2, 130);
		assert.equal(line.stroke, "black");
	});

	it("omits stroke when not provided", () => {
		const line = new LineShape("l1", 0, 0, 1, 1);
		assert.equal(line.stroke, undefined);
	});
});

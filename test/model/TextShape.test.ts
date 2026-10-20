import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TextShape } from "../../src/model/TextShape.js";

describe("TextShape", () => {
	it("exposes position and content", () => {
		const text = new TextShape("title", 20, 40, "My Diagram");
		assert.equal(text.id, "title");
		assert.equal(text.x, 20);
		assert.equal(text.y, 40);
		assert.equal(text.content, "My Diagram");
	});
});

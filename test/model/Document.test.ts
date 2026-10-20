import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Document } from "../../src/model/Document.js";

describe("Document", () => {
	it("stores canvas width and height", () => {
		const doc = new Document(800, 600);
		assert.equal(doc.width, 800);
		assert.equal(doc.height, 600);
	});
});

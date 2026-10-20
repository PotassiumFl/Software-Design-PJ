import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Document } from "../../src/model/Document.js";
import { RectShape } from "../../src/model/RectShape.js";

describe("Document shape index", () => {
	it("adds a root-level shape", () => {
		const doc = new Document(800, 600);
		const rect = new RectShape("r1", 0, 0, 10, 10);
		doc.addRootShape(rect);
		assert.equal(doc.getRootShapes().length, 1);
		assert.equal(doc.findById("r1"), rect);
	});

	it("rejects duplicate ids", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("r1", 0, 0, 10, 10));
		assert.throws(
			() => doc.addRootShape(new RectShape("r1", 1, 1, 2, 2)),
			/id already exists: r1/,
		);
	});
});

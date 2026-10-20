import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Document } from "../../src/model/Document.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

describe("Document hierarchy", () => {
	it("adds a shape under an existing group", () => {
		const doc = new Document(800, 600);
		const group = new GroupShape("node1");
		doc.addRootShape(group);

		const rect = new RectShape("start", 120, 100, 160, 60);
		doc.addShapeToContainer("node1", rect);

		assert.equal(doc.findById("start"), rect);
		assert.equal(group.getChildren().length, 1);
	});

	it("rejects duplicate ids when adding under a container", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new GroupShape("g1"));
		doc.addShapeToContainer("g1", new RectShape("r1", 0, 0, 1, 1));

		assert.throws(
			() => doc.addShapeToContainer("g1", new RectShape("r1", 2, 2, 3, 3)),
			/id already exists: r1/,
		);
	});

	it("throws when container id is missing", () => {
		const doc = new Document(800, 600);
		assert.throws(
			() => doc.addShapeToContainer("node9", new RectShape("r1", 0, 0, 1, 1)),
			/no such container: node9/,
		);
	});

	it("throws when target is not a group", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("start", 0, 0, 10, 10));

		assert.throws(
			() => doc.addShapeToContainer("start", new RectShape("r2", 1, 1, 2, 2)),
			/not a container: start/,
		);
	});
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GroupCommand } from "../../src/command/GroupCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function storeWithLooseShapes(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
	doc.addRootShape(new CircleShape("c1", 100, 100, 20, "red"));
	doc.addRootShape(new RectShape("box", 200, 80, 60, 60, "#3366ff"));
	store.setDocument(doc);
	return store;
}

describe("GroupCommand", () => {
	it("creates a group and moves members under it", () => {
		const store = storeWithLooseShapes();
		const command = new GroupCommand(store, "markers", "c1", "box");

		assert.equal(command.execute(), "g#markers created with 2 children");

		const doc = store.getDocument();
		const markers = doc.findById("markers");
		assert.ok(markers instanceof GroupShape);
		assert.equal(markers.getChildren().length, 2);
		assert.equal(doc.getRootShapes().length, 2);
		assert.equal(doc.findById("c1")?.id, "c1");
	});

	it("rejects grouping a container with its descendant", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new GroupShape("markers"));
		doc.addShapeToContainer("markers", new CircleShape("c1", 100, 100, 20));
		store.setDocument(doc);

		const command = new GroupCommand(store, "bad", "c1", "markers");
		assert.equal(
			command.execute(),
			"error: cannot group a container into its own descendant: markers",
		);
		assert.equal(store.getDocument().findById("bad"), undefined);
	});

	it("returns no such shape when a member is missing", () => {
		const store = storeWithLooseShapes();
		const command = new GroupCommand(store, "g1", "c1", "r9");

		assert.equal(command.execute(), "error: no such shape: r9");
	});

	it("returns id already exists when new group id is taken", () => {
		const store = storeWithLooseShapes();
		const command = new GroupCommand(store, "c1", "box");

		assert.equal(command.execute(), "error: id already exists: c1");
	});
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DeleteShapeCommand } from "../../src/command/DeleteShapeCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function storeWithMarkersGroup(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new GroupShape("markers"));
	doc.addShapeToContainer(
		"markers",
		new CircleShape("c1", 100, 100, 20, "red"),
	);
	doc.addShapeToContainer(
		"markers",
		new RectShape("box", 200, 80, 60, 60, "#3366ff"),
	);
	store.setDocument(doc);
	return store;
}

describe("DeleteShapeCommand", () => {
	it("deletes a shape and restores into parent on undo", () => {
		const store = storeWithMarkersGroup();
		const command = new DeleteShapeCommand(store, "box");

		assert.equal(command.execute(), "rect#box deleted");
		assert.equal(store.getDocument().findById("box"), undefined);

		assert.equal(command.undo(), "rect#box restored into g#markers");
		assert.ok(store.getDocument().findById("box") instanceof RectShape);
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithMarkersGroup();
		const command = new DeleteShapeCommand(store, "r9");

		assert.equal(command.execute(), "error: no such shape: r9");
	});
});

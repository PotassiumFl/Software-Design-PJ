import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AddToCommand } from "../../src/command/AddToCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function storeWithMarkersAndBox(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new GroupShape("markers"));
	doc.addShapeToContainer("markers", new CircleShape("c1", 100, 100, 20));
	doc.addRootShape(new RectShape("box", 200, 80, 60, 60));
	store.setDocument(doc);
	return store;
}

describe("AddToCommand", () => {
	it("moves a shape into a container as the last child", () => {
		const store = storeWithMarkersAndBox();
		const command = new AddToCommand(store, "markers", "box");

		assert.equal(command.execute(), "rect#box added to g#markers");

		const markers = store.getDocument().findById("markers") as GroupShape;
		assert.equal(markers.getChildren().length, 2);
		assert.equal(markers.getChildren()[1]?.id, "box");
		assert.equal(
			store.getDocument().getRootShapes().some((shape) => shape.id === "box"),
			false,
		);
	});

	it("returns not a container when target is a leaf", () => {
		const store = storeWithMarkersAndBox();
		const command = new AddToCommand(store, "box", "c1");

		assert.equal(command.execute(), "error: not a container: box");
	});

	it("undo moves the shape back to its previous parent", () => {
		const store = storeWithMarkersAndBox();
		const command = new AddToCommand(store, "markers", "box");
		command.execute();

		assert.equal(command.undo(), "rect#box removed from g#markers");
		const doc = store.getDocument();
		assert.equal(doc.getRootShapes().some((shape) => shape.id === "box"), true);
		const markers = doc.findById("markers") as GroupShape;
		assert.equal(markers.getChildren().length, 1);
	});

	it("returns no such shape when member is missing", () => {
		const store = storeWithMarkersAndBox();
		const command = new AddToCommand(store, "markers", "r9");

		assert.equal(command.execute(), "error: no such shape: r9");
	});
});

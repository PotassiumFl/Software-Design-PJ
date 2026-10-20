import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ZOrderCommand } from "../../src/command/ZOrderCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function storeWithThreeRoots(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
	doc.addRootShape(new CircleShape("c1", 100, 100, 20, "red"));
	doc.addRootShape(new RectShape("box", 200, 80, 60, 60, "#3366ff"));
	store.setDocument(doc);
	return store;
}

function rootIds(store: DocumentStore): string[] {
	return store.getDocument().getRootShapes().map((s) => s.id);
}

describe("ZOrderCommand", () => {
	it("moves a root shape to front among siblings", () => {
		const store = storeWithThreeRoots();
		const command = new ZOrderCommand(store, "c1", "front");

		assert.equal(command.execute(), "circle#c1 moved to front");
		assert.deepEqual(rootIds(store), ["bg", "box", "c1"]);
	});

	it("moves a root shape to back among siblings", () => {
		const store = storeWithThreeRoots();
		const command = new ZOrderCommand(store, "box", "back");

		assert.equal(command.execute(), "rect#box moved to back");
		assert.deepEqual(rootIds(store), ["box", "bg", "c1"]);
	});

	it("reorders within a group container", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		const markers = new GroupShape("markers");
		doc.addRootShape(markers);
		markers.addChild(new CircleShape("c1", 100, 100, 20, "red"));
		markers.addChild(new RectShape("box", 200, 80, 60, 60, "#3366ff"));
		store.setDocument(doc);

		const command = new ZOrderCommand(store, "c1", "front");
		assert.equal(command.execute(), "circle#c1 moved to front");

		const group = doc.findById("markers") as GroupShape;
		assert.deepEqual(
			group.getChildren().map((s) => s.id),
			["box", "c1"],
		);
	});

	it("undo restores previous sibling order", () => {
		const store = storeWithThreeRoots();
		const command = new ZOrderCommand(store, "c1", "front");
		command.execute();

		assert.equal(command.undo(), "circle#c1 moved to back");
		assert.deepEqual(rootIds(store), ["bg", "c1", "box"]);
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithThreeRoots();
		const command = new ZOrderCommand(store, "r9", "front");

		assert.equal(command.execute(), "error: no such shape: r9");
	});
});

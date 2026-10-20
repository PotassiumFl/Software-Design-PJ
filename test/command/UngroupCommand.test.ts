import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { UngroupCommand } from "../../src/command/UngroupCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { GroupShape } from "../../src/model/GroupShape.js";

function storeWithNestedGroup(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new GroupShape("markers"));
	doc.addShapeToContainer("markers", new GroupShape("cluster"));
	doc.addShapeToContainer("cluster", new CircleShape("c1", 10, 10, 5));
	store.setDocument(doc);
	return store;
}

describe("UngroupCommand", () => {
	it("promotes children when ungrouping a nested container", () => {
		const store = storeWithNestedGroup();
		const command = new UngroupCommand(store, "cluster");

		assert.equal(command.execute(), "g#cluster ungrouped (1 shape promoted)");

		const markers = store.getDocument().findById("markers") as GroupShape;
		assert.equal(store.getDocument().findById("cluster"), undefined);
		assert.equal(markers.getChildren().length, 1);
		assert.equal(markers.getChildren()[0]?.id, "c1");
	});

	it("rejects ungroup on a top-level container", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new GroupShape("scene"));
		store.setDocument(doc);

		const command = new UngroupCommand(store, "scene");
		assert.equal(
			command.execute(),
			"error: cannot ungroup top-level container: scene",
		);
	});

	it("undo restores the dissolved group and child order", () => {
		const store = storeWithNestedGroup();
		const command = new UngroupCommand(store, "cluster");
		command.execute();

		assert.equal(command.undo(), "g#cluster restored with 1 child");
		assert.ok(store.getDocument().findById("cluster") instanceof GroupShape);
		assert.ok(store.getDocument().findById("c1") instanceof CircleShape);
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithNestedGroup();
		const command = new UngroupCommand(store, "r9");

		assert.equal(command.execute(), "error: no such shape: r9");
	});
});

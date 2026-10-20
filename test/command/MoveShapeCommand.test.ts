import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INVALID_ARGUMENTS } from "../../src/command/CommandMessages.js";
import { MoveShapeCommand } from "../../src/command/MoveShapeCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function storeWithCircle(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new CircleShape("c1", 100, 100, 20, "red"));
	store.setDocument(doc);
	return store;
}

describe("MoveShapeCommand", () => {
	it("moves a rect with moved to absolute coordinates", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("r1", 100, 20, 50, 40));
		store.setDocument(doc);

		const command = new MoveShapeCommand(store, "r1", 30, 6);
		assert.equal(command.execute(), "rect#r1 moved to (130,26)");
	});

	it("moves a circle and returns phase_cli_1 summary", () => {
		const store = storeWithCircle();
		const command = new MoveShapeCommand(store, "c1", 30, 0);

		assert.equal(command.execute(), "circle#c1 moved to (130,100)");
		const circle = store.getDocument().findById("c1");
		assert.ok(circle instanceof CircleShape);
		assert.equal(circle.cx, 130);
		assert.equal(circle.cy, 100);
	});

	it("returns undo message with previous position", () => {
		const store = storeWithCircle();
		const command = new MoveShapeCommand(store, "c1", 30, 0);
		command.execute();

		assert.equal(command.undo(), "circle#c1 moved back to (100,100)");
		const circle = store.getDocument().findById("c1") as CircleShape;
		assert.equal(circle.cx, 100);
	});

	it("moves a group with container wording", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		const node2 = new GroupShape("node2");
		node2.addChild(new RectShape("process", 520, 100, 160, 60));
		doc.addRootShape(node2);
		store.setDocument(doc);

		const command = new MoveShapeCommand(store, "node2", 0, 100);
		assert.equal(command.execute(), "g#node2 moved by (0,100)");
		assert.equal(command.undo(), "g#node2 moved back by (0,-100)");
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithCircle();
		const command = new MoveShapeCommand(store, "r9", 1, 1);

		assert.equal(command.execute(), "error: no such shape: r9");
	});

	it("returns invalid arguments when deltas are not numbers", () => {
		const store = storeWithCircle();
		const command = new MoveShapeCommand(store, "c1", Number("x"), 0);

		assert.equal(command.execute(), INVALID_ARGUMENTS);
	});
});

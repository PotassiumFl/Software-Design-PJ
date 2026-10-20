import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INVALID_ARGUMENTS } from "../../src/command/CommandMessages.js";
import { ScaleShapeCommand } from "../../src/command/ScaleShapeCommand.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function storeWithRect(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new RectShape("box", 200, 80, 60, 60, "#3366ff"));
	store.setDocument(doc);
	return store;
}

describe("ScaleShapeCommand", () => {
	it("scales rect geometry by factor", () => {
		const store = storeWithRect();
		const command = new ScaleShapeCommand(store, "box", 2);

		const summary = command.execute();
		assert.match(summary, /^rect#box scaled/);

		const box = store.getDocument().findById("box") as RectShape;
		assert.equal(box.x, 400);
		assert.equal(box.y, 160);
		assert.equal(box.width, 120);
		assert.equal(box.height, 120);
	});

	it("rejects non-positive factor", () => {
		const store = storeWithRect();
		const command = new ScaleShapeCommand(store, "box", 0);

		assert.equal(command.execute(), "error: scale factor must be positive");
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithRect();
		const command = new ScaleShapeCommand(store, "r9", 2);

		assert.equal(command.execute(), "error: no such shape: r9");
	});

	it("scales a circle leaf by factor", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new CircleShape("c1", 10, 20, 5, "red"));
		store.setDocument(doc);

		const command = new ScaleShapeCommand(store, "c1", 2);
		assert.match(command.execute(), /^circle#c1 scaled/);
		const circle = store.getDocument().findById("c1") as CircleShape;
		assert.equal(circle.cx, 20);
		assert.equal(circle.cy, 40);
		assert.equal(circle.r, 10);
	});

	it("scales every descendant when the target is a group", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new GroupShape("markers"));
		doc.addShapeToContainer(
			"markers",
			new CircleShape("c1", 10, 10, 5),
		);
		doc.addShapeToContainer(
			"markers",
			new RectShape("box", 20, 20, 10, 10),
		);
		store.setDocument(doc);

		const command = new ScaleShapeCommand(store, "markers", 2);
		assert.match(command.execute(), /^g#markers scaled by 2/);
		const circle = store.getDocument().findById("c1") as CircleShape;
		const box = store.getDocument().findById("box") as RectShape;
		assert.equal(circle.cx, 20);
		assert.equal(box.width, 20);
	});

	it("returns invalid arguments when factor is not numeric", () => {
		const store = storeWithRect();
		const command = new ScaleShapeCommand(store, "box", Number.NaN);

		assert.equal(command.execute(), INVALID_ARGUMENTS);
	});
});

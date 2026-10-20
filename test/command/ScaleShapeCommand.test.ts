import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INVALID_ARGUMENTS } from "../../src/command/CommandMessages.js";
import { ScaleShapeCommand } from "../../src/command/ScaleShapeCommand.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
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

	it("returns invalid arguments when factor is not numeric", () => {
		const store = storeWithRect();
		const command = new ScaleShapeCommand(store, "box", Number.NaN);

		assert.equal(command.execute(), INVALID_ARGUMENTS);
	});
});

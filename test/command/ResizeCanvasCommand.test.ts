import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ResizeCanvasCommand } from "../../src/command/ResizeCanvasCommand.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";

function storeWithCanvas(w = 800, h = 600): DocumentStore {
	const store = new DocumentStore();
	store.setDocument(new Document(w, h));
	return store;
}

describe("ResizeCanvasCommand", () => {
	it("updates document width and height", () => {
		const store = storeWithCanvas();
		const command = new ResizeCanvasCommand(store, 1024, 768);

		assert.equal(command.execute(), "canvas 1024x768 resized");

		const doc = store.getDocument();
		assert.equal(doc.width, 1024);
		assert.equal(doc.height, 768);
	});

	it("undo restores previous canvas size", () => {
		const store = storeWithCanvas();
		const command = new ResizeCanvasCommand(store, 400, 300);
		command.execute();

		assert.equal(command.undo(), "canvas 800x600 resized");
		const doc = store.getDocument();
		assert.equal(doc.width, 800);
		assert.equal(doc.height, 600);
	});

	it("rejects non-positive dimensions", () => {
		const store = storeWithCanvas();
		const command = new ResizeCanvasCommand(store, 0, 600);

		assert.equal(
			command.execute(),
			"error: canvas dimensions must be positive",
		);
		assert.equal(store.getDocument().width, 800);
	});
});

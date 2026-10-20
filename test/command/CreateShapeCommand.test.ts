import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INVALID_ARGUMENTS } from "../../src/command/CommandMessages.js";
import { CreateShapeCommand } from "../../src/command/CreateShapeCommand.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { ShapeRegistry } from "../../src/model/ShapeRegistry.js";

function storeWithDocument(): DocumentStore {
	const store = new DocumentStore();
	store.setDocument(new Document(800, 600));
	return store;
}

describe("CreateShapeCommand", () => {
	it("creates rect and returns summary", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(
			store,
			new ShapeRegistry(),
			["rect", "bg", "0", "0", "100", "50", "#ffffff"],
		);

		assert.equal(command.execute(), "rect#bg created");
		assert.equal(store.getDocument().findById("bg")?.id, "bg");
	});

	it("returns unknown shape type for box", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"box",
			"n1",
			"0",
			"0",
			"10",
			"10",
			"title",
		]);

		assert.equal(
			command.execute(),
			"error: unknown shape type: box (is the plugin loaded?)",
		);
	});

	it("returns error for incomplete rect arguments", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"rect",
			"r1",
			"0",
			"0",
		]);

		assert.equal(command.execute(), INVALID_ARGUMENTS);
	});

	it("returns id already exists when id is taken", () => {
		const store = storeWithDocument();
		const registry = new ShapeRegistry();
		new CreateShapeCommand(store, registry, [
			"rect",
			"r1",
			"0",
			"0",
			"1",
			"1",
		]).execute();

		const second = new CreateShapeCommand(store, registry, [
			"rect",
			"r1",
			"2",
			"2",
			"3",
			"3",
		]);
		assert.equal(second.execute(), "error: id already exists: r1");
	});
});

describe("CreateShapeCommand builtin leaf shapes", () => {
	it("creates circle and returns summary", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"circle",
			"c1",
			"100",
			"100",
			"20",
			"red",
		]);

		assert.equal(command.execute(), "circle#c1 created");
		assert.equal(store.getDocument().findById("c1")?.id, "c1");
	});

	it("creates ellipse and returns summary", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"ellipse",
			"e1",
			"1",
			"2",
			"3",
			"4",
		]);

		assert.equal(command.execute(), "ellipse#e1 created");
	});

	it("creates line and returns summary", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"line",
			"arrow1",
			"280",
			"130",
			"520",
			"130",
			"black",
		]);

		assert.equal(command.execute(), "line#arrow1 created");
	});

	it("creates text and returns summary", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"text",
			"title",
			"20",
			"40",
			"My Diagram",
		]);

		assert.equal(command.execute(), "text#title created");
		assert.equal(
			(store.getDocument().findById("title") as { content: string }).content,
			"My Diagram",
		);
	});

});

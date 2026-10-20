import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INVALID_ARGUMENTS } from "../../src/command/CommandMessages.js";
import { CreateShapeCommand } from "../../src/command/CreateShapeCommand.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { ShapeRegistry } from "../../src/model/ShapeRegistry.js";
import { TextShape } from "../../src/model/TextShape.js";

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
		const title = store.getDocument().findById("title");
		assert.ok(title instanceof TextShape);
		assert.equal(title.content, "My Diagram");
	});
});

describe("CreateShapeCommand groups", () => {
	it("creates empty group at root", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"g",
			"flowchart",
		]);

		assert.equal(command.execute(), "g#flowchart created");
		assert.equal(store.getDocument().findById("flowchart")?.id, "flowchart");
	});

	it("returns invalid arguments when group id is missing", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), ["g"]);

		assert.equal(command.execute(), INVALID_ARGUMENTS);
	});
});

describe("CreateShapeCommand in container", () => {
	it("creates rect inside group with in clause", () => {
		const store = storeWithDocument();
		const registry = new ShapeRegistry();
		new CreateShapeCommand(store, registry, ["g", "node1"]).execute();

		const command = new CreateShapeCommand(store, registry, [
			"rect",
			"start",
			"120",
			"100",
			"160",
			"60",
			"#4a90d9",
			"in",
			"node1",
		]);

		assert.equal(command.execute(), "rect#start created in g#node1");
	});

	it("creates nested group with in clause", () => {
		const store = storeWithDocument();
		const registry = new ShapeRegistry();
		new CreateShapeCommand(store, registry, ["g", "flowchart"]).execute();

		assert.equal(
			new CreateShapeCommand(store, registry, [
				"g",
				"node1",
				"in",
				"flowchart",
			]).execute(),
			"g#node1 created in g#flowchart",
		);
	});

	it("creates text inside group", () => {
		const store = storeWithDocument();
		const registry = new ShapeRegistry();
		new CreateShapeCommand(store, registry, ["g", "node1"]).execute();

		assert.equal(
			new CreateShapeCommand(store, registry, [
				"text",
				"start-label",
				"155",
				"135",
				"开始",
				"in",
				"node1",
			]).execute(),
			"text#start-label created in g#node1",
		);
	});

	it("returns no such container when parent is missing", () => {
		const store = storeWithDocument();
		const command = new CreateShapeCommand(store, new ShapeRegistry(), [
			"rect",
			"r1",
			"0",
			"0",
			"1",
			"1",
			"in",
			"node9",
		]);

		assert.equal(command.execute(), "error: no such container: node9");
		assert.equal(store.getDocument().findById("r1"), undefined);
	});

	it("returns not a container when parent is a leaf", () => {
		const store = storeWithDocument();
		const registry = new ShapeRegistry();
		new CreateShapeCommand(store, registry, [
			"rect",
			"start",
			"0",
			"0",
			"10",
			"10",
		]).execute();

		const command = new CreateShapeCommand(store, registry, [
			"rect",
			"r2",
			"1",
			"1",
			"2",
			"2",
			"in",
			"start",
		]);

		assert.equal(command.execute(), "error: not a container: start");
		assert.equal(store.getDocument().findById("r2"), undefined);
	});
});

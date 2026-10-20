import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CommandHistory } from "../../src/app/CommandHistory.js";
import { CreateShapeCommand } from "../../src/command/CreateShapeCommand.js";
import { MoveShapeCommand } from "../../src/command/MoveShapeCommand.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { ShapeRegistry } from "../../src/model/ShapeRegistry.js";

function storeWithCircle(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new CircleShape("c1", 100, 100, 20, "red"));
	store.setDocument(doc);
	return store;
}

describe("CommandHistory", () => {
	it("undo restores state after a create", () => {
		const store = new DocumentStore();
		store.setDocument(new Document(800, 600));
		const history = new CommandHistory();

		history.execute(
			new CreateShapeCommand(store, new ShapeRegistry(), [
				"rect",
				"bg",
				"0",
				"0",
				"10",
				"10",
			]),
		);
		assert.equal(store.getDocument().findById("bg")?.id, "bg");

		history.undo();
		assert.equal(store.getDocument().findById("bg"), undefined);
	});

	it("redo re-applies an undone edit", () => {
		const store = new DocumentStore();
		store.setDocument(new Document(800, 600));
		const history = new CommandHistory();

		history.execute(
			new CreateShapeCommand(store, new ShapeRegistry(), [
				"circle",
				"c1",
				"100",
				"100",
				"20",
			]),
		);
		history.undo();
		history.redo();
		assert.ok(store.getDocument().findById("c1") instanceof CircleShape);
	});

	it("clears redo stack when a new edit runs after undo", () => {
		const store = storeWithCircle();
		const history = new CommandHistory();
		const registry = new ShapeRegistry();

		history.execute(
			new MoveShapeCommand(store, "c1", 30, 0),
		);
		assert.equal(
			(store.getDocument().findById("c1") as CircleShape).cx,
			130,
		);

		history.undo();
		assert.equal(
			(store.getDocument().findById("c1") as CircleShape).cx,
			100,
		);

		history.execute(
			new CreateShapeCommand(store, registry, [
				"rect",
				"r2",
				"0",
				"0",
				"1",
				"1",
			]),
		);
		history.redo();
		assert.equal(
			(store.getDocument().findById("c1") as CircleShape).cx,
			100,
		);
	});
});

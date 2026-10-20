import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SetAttributeCommand } from "../../src/command/SetAttributeCommand.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { TextShape } from "../../src/model/TextShape.js";

function storeWithTitle(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new TextShape("title", 20, 40, "My Diagram"));
	store.setDocument(doc);
	return store;
}

describe("SetAttributeCommand", () => {
	it("updates text content with assignment summary", () => {
		const store = storeWithTitle();
		const command = new SetAttributeCommand(
			store,
			"title",
			"text",
			"My Diagram v2",
		);

		assert.equal(
			command.execute(),
			'text#title updated: text="My Diagram v2"',
		);
		const title = store.getDocument().findById("title") as TextShape;
		assert.equal(title.content, "My Diagram v2");

		assert.equal(
			command.undo(),
			'text#title updated: text="My Diagram"',
		);
		assert.equal(title.content, "My Diagram");
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithTitle();
		const command = new SetAttributeCommand(store, "r9", "text", "x");

		assert.equal(command.execute(), "error: no such shape: r9");
	});
});

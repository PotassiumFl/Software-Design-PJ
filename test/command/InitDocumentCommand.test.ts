import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { InitDocumentCommand } from "../../src/command/InitDocumentCommand.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";

describe("InitDocumentCommand", () => {
	it("creates a document and returns success message", () => {
		const store = new DocumentStore();
		const command = new InitDocumentCommand(store, 800, 600);

		assert.equal(command.execute(), "canvas 800x600 created");
		assert.equal(store.hasDocument(), true);
		assert.equal(store.getDocument().width, 800);
		assert.equal(store.getDocument().height, 600);
	});
});

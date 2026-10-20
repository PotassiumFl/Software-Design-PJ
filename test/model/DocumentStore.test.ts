import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";

describe("DocumentStore", () => {
	it("starts with no document", () => {
		const store = new DocumentStore();
		assert.equal(store.hasDocument(), false);
	});

	it("getDocument throws when empty", () => {
		const store = new DocumentStore();
		assert.throws(() => store.getDocument(), /no document/);
	});

	it("holds a document after setDocument", () => {
		const store = new DocumentStore();
		const doc = new Document(400, 200);
		store.setDocument(doc);
		assert.equal(store.hasDocument(), true);
		assert.equal(store.getDocument(), doc);
	});
});

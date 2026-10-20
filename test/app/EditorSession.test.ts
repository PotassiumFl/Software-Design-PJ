import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EditorSession } from "../../src/app/EditorSession.js";

describe("EditorSession", () => {
	it("starts with no document", () => {
		const session = new EditorSession();
		assert.equal(session.hasDocument, false);
	});

	it("runInit sets document and returns summary", () => {
		const session = new EditorSession();
		assert.equal(session.runInit(400, 200), "canvas 400x200 created");
		assert.equal(session.hasDocument, true);
	});

	it("runInit defaults to 800x600", () => {
		const session = new EditorSession();
		assert.equal(session.runInit(), "canvas 800x600 created");
	});
});

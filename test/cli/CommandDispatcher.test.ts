import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EditorSession } from "../../src/app/EditorSession.js";
import { CommandDispatcher } from "../../src/cli/CommandDispatcher.js";

describe("CommandDispatcher.dispatch", () => {
	it("returns null for empty tokens", () => {
		const dispatcher = new CommandDispatcher(new EditorSession());
		assert.equal(dispatcher.dispatch([]), null);
	});

	it("returns help text for help command", () => {
		const dispatcher = new CommandDispatcher(new EditorSession());
		const output = dispatcher.dispatch(["help"]);
		assert.ok(output?.includes("init"));
		assert.ok(output?.includes("create"));
	});

	it("returns unknown command for unimplemented commands", () => {
		const dispatcher = new CommandDispatcher(new EditorSession());
		assert.equal(
			dispatcher.dispatch(["foo"]),
			"error: unknown command: foo",
		);
	});
});

describe("CommandDispatcher.init", () => {
	it("creates canvas with explicit size", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);

		assert.equal(
			dispatcher.dispatch(["init", "800", "600"]),
			"canvas 800x600 created",
		);
		assert.equal(session.hasDocument, true);
	});

	it("creates canvas with default 800x600", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);

		assert.equal(dispatcher.dispatch(["init"]), "canvas 800x600 created");
		assert.equal(session.hasDocument, true);
	});

	it("still reports unknown for unimplemented commands after init", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init", "100", "100"]);

		assert.equal(
			dispatcher.dispatch(["create", "rect", "r", "0", "0", "1", "1"]),
			"error: unknown command: create",
		);
	});
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EditorSession } from "../../src/app/EditorSession.js";
import { CommandDispatcher } from "../../src/cli/CommandDispatcher.js";

describe("CommandDispatcher.dispatch", () => {
	const dispatcher = new CommandDispatcher(new EditorSession());

	it("returns null for empty tokens", () => {
		assert.equal(dispatcher.dispatch([]), null);
	});

	it("returns help text for help command", () => {
		const output = dispatcher.dispatch(["help"]);
		assert.ok(output?.includes("init"));
		assert.ok(output?.includes("create"));
	});

	it("returns unknown command for anything not implemented yet", () => {
		assert.equal(
			dispatcher.dispatch(["foo"]),
			"error: unknown command: foo",
		);
		assert.equal(
			dispatcher.dispatch(["init"]),
			"error: unknown command: init",
		);
	});
});

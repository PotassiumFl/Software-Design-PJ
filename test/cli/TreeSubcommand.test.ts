import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CommandDispatcher } from "../../src/cli/CommandDispatcher.js";
import { EditorSession } from "../../src/app/EditorSession.js";

describe("tree <id> (defect gap §2)", () => {
	it("shows only the subtree for the given id", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init"]);
		dispatcher.dispatch(["create", "rect", "bg", "0", "0", "100", "100"]);
		dispatcher.dispatch(["create", "circle", "c1", "10", "10", "5", "red"]);
		dispatcher.dispatch(["create", "rect", "box", "20", "20", "5", "5"]);
		dispatcher.dispatch(["group", "markers", "c1", "box"]);

		const output = dispatcher.dispatch(["tree", "markers"]);
		assert.ok(output);
		assert.doesNotMatch(output, /rect#bg/);
		assert.doesNotMatch(output, /svg \(800x600\)/);
		assert.match(output, /^g#markers/m);
		assert.match(output, /circle#c1/);
		assert.match(output, /rect#box/);
	});
});

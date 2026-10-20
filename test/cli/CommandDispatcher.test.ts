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

});

describe("CommandDispatcher.create and tree", () => {
	it("requires a document before create", () => {
		const dispatcher = new CommandDispatcher(new EditorSession());
		assert.equal(
			dispatcher.dispatch(["create", "rect", "r", "0", "0", "1", "1"]),
			"error: no document. use 'init' or 'read' first",
		);
	});

	it("creates rect after init", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init", "800", "600"]);

		assert.equal(
			dispatcher.dispatch([
				"create",
				"rect",
				"bg",
				"0",
				"0",
				"100",
				"50",
				"#ffffff",
			]),
			"rect#bg created",
		);
	});

	it("reports unknown shape type for create box", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init"]);

		assert.equal(
			dispatcher.dispatch([
				"create",
				"box",
				"n1",
				"0",
				"0",
				"10",
				"10",
				"title",
			]),
			"error: unknown shape type: box (is the plugin loaded?)",
		);
	});

	it("renders tree for current document", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init", "800", "600"]);
		dispatcher.dispatch(["create", "rect", "bg", "0", "0", "800", "600", "#ffffff"]);

		const output = dispatcher.dispatch(["tree"]);
		assert.ok(output?.includes("svg (800x600)"));
		assert.ok(output?.includes("rect#bg"));
	});

	it("creates circle and text at root after init", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init"]);

		assert.equal(
			dispatcher.dispatch([
				"create",
				"text",
				"title",
				"20",
				"40",
				"My Diagram",
			]),
			"text#title created",
		);
		assert.equal(
			dispatcher.dispatch([
				"create",
				"circle",
				"c1",
				"100",
				"100",
				"20",
				"red",
			]),
			"circle#c1 created",
		);
	});
});

describe("CommandDispatcher hierarchy (S12–S13)", () => {
	it("runs flowchart skeleton from phase_cli_1 section 6", () => {
		const session = new EditorSession();
		const dispatcher = new CommandDispatcher(session);
		dispatcher.dispatch(["init", "800", "600"]);

		assert.equal(
			dispatcher.dispatch(["create", "g", "flowchart"]),
			"g#flowchart created",
		);
		assert.equal(
			dispatcher.dispatch(["create", "g", "node1", "in", "flowchart"]),
			"g#node1 created in g#flowchart",
		);
		assert.equal(
			dispatcher.dispatch([
				"create",
				"rect",
				"start",
				"120",
				"100",
				"160",
				"60",
				"#4a90d9",
				"in",
				"node1",
			]),
			"rect#start created in g#node1",
		);

		const tree = dispatcher.dispatch(["tree"]);
		assert.ok(tree?.includes("g#flowchart"));
		assert.ok(tree?.includes("rect#start"));
		assert.ok(tree?.includes("├──") || tree?.includes("└──"));
	});
});

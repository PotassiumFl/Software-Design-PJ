import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CommandLineTokenizer } from "../../src/cli/CommandLineTokenizer.js";

describe("CommandLineTokenizer.tokenize", () => {
	it("returns empty array for blank lines", () => {
		assert.deepEqual(CommandLineTokenizer.tokenize(""), []);
		assert.deepEqual(CommandLineTokenizer.tokenize("   "), []);
	});

	it("returns empty array when line starts with #", () => {
		assert.deepEqual(CommandLineTokenizer.tokenize("# 先建容器"), []);
		assert.deepEqual(CommandLineTokenizer.tokenize("  # x"), []);
	});

	it("splits a simple command", () => {
		assert.deepEqual(CommandLineTokenizer.tokenize("init 800 600"), [
			"init",
			"800",
			"600",
		]);
	});

	it("keeps hex color as a token", () => {
		const tokens = CommandLineTokenizer.tokenize(
			"create rect r 0 0 10 10 #ffffff",
		);
		assert.equal(tokens.at(-1), "#ffffff");
	});

	it("supports quoted text with spaces", () => {
		const tokens = CommandLineTokenizer.tokenize(
			'create text t 20 40 "My Diagram"',
		);
		assert.equal(tokens.at(-1), "My Diagram");
	});

	it("trims and collapses whitespace between tokens", () => {
		assert.deepEqual(CommandLineTokenizer.tokenize("  create   rect  r  "), [
			"create",
			"rect",
			"r",
		]);
	});

	it("tokenizes quit", () => {
		assert.deepEqual(CommandLineTokenizer.tokenize("quit"), ["quit"]);
	});
});

import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { NO_SAVE_PATH } from "../../src/command/CommandMessages.js";
import { EditorSession } from "../../src/app/EditorSession.js";

const IO_LOCK = "error: undo not allowed after io command";

const fixturesDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../fixtures/svg",
);

describe("EditorSession IO lock (G S22)", () => {
	it("blocks undo and redo after save", () => {
		const session = new EditorSession();
		session.runInit();
		session.runCreate(["rect", "r1", "0", "0", "10", "10"]);
		session.runSave(path.join(os.tmpdir(), "unused-demo.svg"));

		assert.equal(session.runUndo(), IO_LOCK);
		assert.equal(session.runRedo(), IO_LOCK);
	});

	it("allows undo again after a new edit following save", () => {
		const session = new EditorSession();
		session.runInit();
		session.runCreate(["rect", "r1", "0", "0", "10", "10"]);
		session.runSave(path.join(os.tmpdir(), "unused-demo.svg"));
		session.runCreate(["rect", "r2", "1", "1", "2", "2"]);

		assert.equal(session.runUndo(), "rect#r2 removed");
	});

	it("blocks undo immediately after read", () => {
		const session = new EditorSession();
		const otherSvg = path.join(fixturesDir, "other.svg");
		session.runRead(otherSvg);

		assert.equal(session.runUndo(), IO_LOCK);
	});

	it("allows undo after the next edit following read", () => {
		const session = new EditorSession();
		const otherSvg = path.join(fixturesDir, "other.svg");
		session.runRead(otherSvg);
		session.runCreate(["circle", "extra", "1", "1", "1"]);

		assert.equal(session.runUndo(), "circle#extra removed");
	});

	it("blocks undo after canvas resize with dimensions", () => {
		const session = new EditorSession();
		session.runInit();
		session.runCreate(["rect", "r1", "0", "0", "10", "10"]);
		session.runCanvas(1024, 768);

		assert.equal(session.runUndo(), IO_LOCK);
	});
});

describe("EditorSession read and save (G S23–S24)", () => {
	it("reads other.svg with warning and element summary", () => {
		const session = new EditorSession();
		const otherSvg = path.join(fixturesDir, "other.svg");

		assert.equal(
			session.runRead(otherSvg),
			[
				"warning: assigned id rect1 to unnamed <rect>",
				"read other.svg (7 elements)",
			].join("\n"),
		);
		assert.equal(session.hasDocument, true);
	});

	it("saves with element count summary", async () => {
		const session = new EditorSession();
		const dir = await mkdtemp(path.join(os.tmpdir(), "svg-save-"));
		const filePath = path.join(dir, "demo.svg");
		session.runInit();
		session.runCreate(["circle", "c1", "100", "100", "20", "red"]);
		session.runCreate(["rect", "box", "200", "80", "60", "60", "#3366ff"]);
		session.runGroup("markers", ["c1", "box"]);

		assert.equal(session.runSave(filePath), "saved to demo.svg (3 elements)");
	});

	it("save without path uses the path from the last read", async () => {
		const session = new EditorSession();
		const dir = await mkdtemp(path.join(os.tmpdir(), "svg-readsave-"));
		const sourcePath = path.join(dir, "other.svg");
		await writeFile(sourcePath, "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"></svg>");

		session.runRead(sourcePath);
		assert.equal(session.runSave(), "saved to other.svg (0 elements)");
	});

	it("save without path reuses the path from a prior explicit save", async () => {
		const session = new EditorSession();
		const dir = await mkdtemp(path.join(os.tmpdir(), "svg-save-again-"));
		const filePath = path.join(dir, "1.svg");
		session.runInit();
		session.runCreate(["rect", "r1", "0", "0", "10", "10"]);

		assert.equal(session.runSave(filePath), "saved to 1.svg (1 elements)");
		assert.equal(session.runSave(), "saved to 1.svg (1 elements)");
	});

	it("reports no save path after init when save has no argument", () => {
		const session = new EditorSession();
		session.runInit();

		assert.equal(session.runSave(), NO_SAVE_PATH);
	});

	it("returns cannot read for a missing file", () => {
		const session = new EditorSession();

		assert.equal(
			session.runRead(path.join(fixturesDir, "nope.svg")),
			"error: cannot read file: nope.svg",
		);
		assert.equal(session.hasDocument, false);
	});

	it("returns cannot write when the target directory is missing", () => {
		const session = new EditorSession();
		session.runInit();

		assert.equal(
			session.runSave(path.join(os.tmpdir(), "no-such-dir-xyz", "a.svg")),
			"error: cannot write file: a.svg",
		);
	});
});

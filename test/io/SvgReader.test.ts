import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { SvgReader } from "../../src/io/SvgReader.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

const fixturesDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../fixtures/svg",
);

describe("SvgReader", () => {
	it("loads phase_cli_1 other.svg with id assignment warning", () => {
		const filePath = path.join(fixturesDir, "other.svg");
		const result = SvgReader.readFile(filePath);

		assert.deepEqual(result.warnings, [
			"warning: assigned id rect1 to unnamed <rect>",
		]);
		assert.equal(result.elementCount, 7);

		const doc = result.document!;
		assert.equal(doc.width, 400);
		assert.equal(doc.height, 300);
		const bg = doc.findById("rect1");
		assert.ok(bg instanceof RectShape);
		assert.equal(bg.fill, "#ffffff");

		const g1 = doc.findById("g1");
		assert.ok(g1 instanceof GroupShape);
		assert.equal(g1.getChildren().length, 2);
		assert.ok(doc.findById("c1") instanceof CircleShape);

		assert.deepEqual(
			doc.getRootShapes().map((shape) => shape.id),
			["rect1", "t1", "c1", "g1", "e1"],
			"root sibling order must match other.svg in phase_cli_1 section 6",
		);
	});

	it("returns cannot read when the file is missing", () => {
		const result = SvgReader.readFile(
			path.join(fixturesDir, "missing.svg"),
		);

		assert.equal(result.error, "error: cannot read file: missing.svg");
		assert.equal(result.document, undefined);
	});

	it("round-trips minimal-flow.svg without warnings", () => {
		const filePath = path.join(fixturesDir, "minimal-flow.svg");
		const result = SvgReader.readFile(filePath);

		assert.equal(result.error, undefined);
		assert.deepEqual(result.warnings, []);
		assert.equal(result.elementCount, 4);

		const doc = result.document!;
		assert.ok(doc.findById("flow") instanceof GroupShape);
		assert.ok(doc.findById("start") instanceof RectShape);
		assert.ok(doc.findById("edge"));
		assert.ok(doc.findById("end") instanceof RectShape);
	});

	it("keeps nested groups and their children in document order", () => {
		const raw = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <g id="flowchart">
    <g id="node1">
      <rect id="start" x="120" y="100" width="160" height="60" fill="#4a90d9"/>
      <text id="start-label" x="155" y="135">开始</text>
    </g>
    <line id="arrow1" x1="280" y1="130" x2="520" y2="130" stroke="black"/>
  </g>
</svg>`;
		const result = SvgReader.parseSvg(raw);
		const doc = result.document!;

		assert.equal(result.error, undefined);
		assert.equal(result.elementCount, 5);
		assert.deepEqual(
			doc.getRootShapes().map((shape) => shape.id),
			["flowchart"],
		);
		const flowchart = doc.findById("flowchart") as GroupShape;
		assert.deepEqual(
			flowchart.getChildren().map((shape) => shape.id),
			["node1", "arrow1"],
		);
		const node1 = doc.findById("node1") as GroupShape;
		assert.deepEqual(
			node1.getChildren().map((shape) => shape.id),
			["start", "start-label"],
		);
		assert.equal((doc.findById("start") as RectShape).fill, "#4a90d9");
	});
});

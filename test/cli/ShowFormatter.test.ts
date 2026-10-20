import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ShowFormatter } from "../../src/cli/ShowFormatter.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { EllipseShape } from "../../src/model/EllipseShape.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { LineShape } from "../../src/model/LineShape.js";

describe("ShowFormatter", () => {
	it("renders phase_cli_1 section 5.2 for a shape in a group", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new GroupShape("markers"));
		doc.addShapeToContainer(
			"markers",
			new CircleShape("c1", 100, 100, 20, "red"),
		);

		const output = ShowFormatter.render(doc, "c1");

		assert.equal(
			output,
			[
				"circle#c1  parent=g#markers",
				"  cx=100 cy=100 r=20",
				"  fill=red",
			].join("\n"),
		);
	});

	it("shows canvas as parent for root-level shapes", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new CircleShape("c1", 50, 50, 10));

		const output = ShowFormatter.render(doc, "c1");

		assert.match(output, /^circle#c1  parent=canvas/m);
		assert.match(output, /\n  cx=50 cy=50 r=10$/);
	});

	it("renders ellipse and line attribute blocks", () => {
		const doc = new Document(400, 300);
		doc.addRootShape(new EllipseShape("e1", 1, 2, 3, 4, "#abc"));
		doc.addRootShape(new LineShape("edge", 0, 0, 10, 20, "black"));

		assert.equal(
			ShowFormatter.render(doc, "e1"),
			[
				"ellipse#e1  parent=canvas",
				"  cx=1 cy=2 rx=3 ry=4",
				"  fill=#abc",
			].join("\n"),
		);
		assert.equal(
			ShowFormatter.render(doc, "edge"),
			[
				"line#edge  parent=canvas",
				"  x1=0 y1=0 x2=10 y2=20",
				"  stroke=black",
			].join("\n"),
		);
	});

	it("returns no such shape for unknown id", () => {
		const doc = new Document(800, 600);

		assert.equal(
			ShowFormatter.render(doc, "r9"),
			"error: no such shape: r9",
		);
	});
});

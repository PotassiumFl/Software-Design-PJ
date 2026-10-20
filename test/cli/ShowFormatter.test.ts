import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ShowFormatter } from "../../src/cli/ShowFormatter.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { GroupShape } from "../../src/model/GroupShape.js";

describe("ShowFormatter", () => {
	it("renders phase_cli_1 section 5.2 for a shape in a group", () => {
		const doc = new Document(800, 600);
		const markers = new GroupShape("markers");
		doc.addRootShape(markers);
		markers.addChild(new CircleShape("c1", 100, 100, 20, "red"));

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
		assert.match(output, /\n  cx=50 cy=50 r=10\n$/);
	});

	it("returns no such shape for unknown id", () => {
		const doc = new Document(800, 600);

		assert.equal(
			ShowFormatter.render(doc, "r9"),
			"error: no such shape: r9",
		);
	});
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TreeFormatter } from "../../src/cli/TreeFormatter.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { RectShape } from "../../src/model/RectShape.js";
import { TextShape } from "../../src/model/TextShape.js";

describe("TreeFormatter", () => {
	it("renders document header and rect line", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));

		const output = TreeFormatter.render(doc);

		assert.match(output, /^svg \(800x600\)/m);
		assert.match(output, /rect#bg\s+x=0 y=0 w=800 h=600 fill=#ffffff/);
	});

	it("renders multiple root-level leaf types", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
		doc.addRootShape(new TextShape("title", 20, 40, "My Diagram"));
		doc.addRootShape(new CircleShape("c1", 100, 100, 20, "red"));

		const output = TreeFormatter.render(doc);

		assert.match(output, /text#title\s+\(20,40\)\s+"My Diagram"/);
		assert.match(output, /circle#c1\s+cx=100 cy=100 r=20 fill=red/);
	});
});

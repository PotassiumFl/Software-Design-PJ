import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TreeFormatter } from "../../src/cli/TreeFormatter.js";
import { Document } from "../../src/model/Document.js";
import { RectShape } from "../../src/model/RectShape.js";

describe("TreeFormatter", () => {
	it("renders document header and rect line", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));

		const output = TreeFormatter.render(doc);

		assert.match(output, /^svg \(800x600\)/m);
		assert.match(output, /rect#bg\s+x=0 y=0 w=800 h=600 fill=#ffffff/);
	});
});

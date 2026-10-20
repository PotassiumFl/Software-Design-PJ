import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TreeFormatter } from "../../src/cli/TreeFormatter.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { EllipseShape } from "../../src/model/EllipseShape.js";
import { LineShape } from "../../src/model/LineShape.js";
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

	it("renders nested groups with tree prefixes", () => {
		const doc = new Document(800, 600);
		const flowchart = new GroupShape("flowchart");
		doc.addRootShape(flowchart);

		const node1 = new GroupShape("node1");
		flowchart.addChild(node1);
		node1.addChild(
			new RectShape("start", 120, 100, 160, 60, "#4a90d9"),
		);
		node1.addChild(new TextShape("start-label", 155, 135, "开始"));

		const output = TreeFormatter.render(doc);

		assert.match(output, /g#flowchart/);
		assert.match(output, /g#node1/);
		assert.match(output, /rect#start\s+x=120 y=100 w=160 h=60 fill=#4a90d9/);
		assert.match(output, /text#start-label\s+\(155,135\)\s+"开始"/);
		assert.ok(output.includes("├──") || output.includes("└──"));
	});

	it("renders ellipse and line attribute columns", () => {
		const doc = new Document(400, 300);
		doc.addRootShape(new EllipseShape("e1", 1, 2, 3, 4, "#abc"));
		doc.addRootShape(new LineShape("edge", 0, 0, 10, 20, "black"));

		const output = TreeFormatter.render(doc);

		assert.match(output, /ellipse#e1\s+cx=1 cy=2 rx=3 ry=4 fill=#abc/);
		assert.match(
			output,
			/line#edge\s+\(0,0\) -> \(10,20\) stroke=black/,
		);
	});

	it("aligns id and geometry columns like phase_cli_1 section 5.1", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
		doc.addRootShape(new TextShape("title", 20, 40, "My Diagram"));
		doc.addRootShape(new GroupShape("markers"));
		doc.addShapeToContainer(
			"markers",
			new CircleShape("c1", 100, 100, 20, "red"),
		);

		const output = TreeFormatter.render(doc);

		assert.match(output, /rect#bg\s{4,}x=0 y=0 w=800 h=600 fill=#ffffff/);
		assert.match(output, /text#title\s{4,}\(20,40\)/);
		assert.match(output, /circle#c1\s+cx=100 cy=100 r=20 fill=red/);
	});

	it("renders only the subtree when a root id is provided", () => {
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("bg", 0, 0, 800, 600, "#ffffff"));
		doc.addRootShape(new GroupShape("markers"));
		doc.addShapeToContainer(
			"markers",
			new CircleShape("c1", 100, 100, 20, "red"),
		);
		doc.addShapeToContainer(
			"markers",
			new RectShape("box", 200, 80, 60, 60, "#3366ff"),
		);

		const output = TreeFormatter.render(doc, "markers");

		assert.doesNotMatch(output, /svg \(800x600\)/);
		assert.doesNotMatch(output, /rect#bg/);
		assert.match(output, /^g#markers/m);
		assert.match(output, /circle#c1/);
		assert.match(output, /rect#box/);
	});
});

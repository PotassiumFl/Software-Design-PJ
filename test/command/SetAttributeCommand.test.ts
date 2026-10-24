import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SetAttributeCommand } from "../../src/command/SetAttributeCommand.js";
import { ShowFormatter } from "../../src/cli/ShowFormatter.js";
import { SvgWriter } from "../../src/io/SvgWriter.js";
import { CircleShape } from "../../src/model/CircleShape.js";
import { Document } from "../../src/model/Document.js";
import { DocumentStore } from "../../src/model/DocumentStore.js";
import { EllipseShape } from "../../src/model/EllipseShape.js";
import { LineShape } from "../../src/model/LineShape.js";
import { RectShape } from "../../src/model/RectShape.js";
import { TextShape } from "../../src/model/TextShape.js";

function storeWithTitle(): DocumentStore {
	const store = new DocumentStore();
	const doc = new Document(800, 600);
	doc.addRootShape(new TextShape("title", 20, 40, "My Diagram"));
	store.setDocument(doc);
	return store;
}

describe("SetAttributeCommand", () => {
	it("updates text content with assignment summary", () => {
		const store = storeWithTitle();
		const command = new SetAttributeCommand(
			store,
			"title",
			"text",
			"My Diagram v2",
		);

		assert.equal(
			command.execute(),
			'text#title updated: text="My Diagram v2"',
		);
		const title = store.getDocument().findById("title") as TextShape;
		assert.equal(title.content, "My Diagram v2");

		assert.equal(
			command.undo(),
			'text#title updated: text="My Diagram"',
		);
		assert.equal(title.content, "My Diagram");
	});

	it("returns no such shape when id is missing", () => {
		const store = storeWithTitle();
		const command = new SetAttributeCommand(store, "r9", "text", "x");

		assert.equal(command.execute(), "error: no such shape: r9");
	});

	it("updates rect fill per phase_cli_1 set whitelist", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("r1", 0, 0, 10, 10));
		store.setDocument(doc);

		const command = new SetAttributeCommand(store, "r1", "fill", "red");
		assert.equal(command.execute(), "rect#r1 updated: fill=red");
		assert.equal(
			(store.getDocument().findById("r1") as RectShape).fill,
			"red",
		);
	});

	it("updates circle radius", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new CircleShape("c1", 50, 50, 10));
		store.setDocument(doc);

		const command = new SetAttributeCommand(store, "c1", "r", "9");
		assert.equal(command.execute(), "circle#c1 updated: r=9");
		assert.equal((store.getDocument().findById("c1") as CircleShape).r, 9);
	});

	it("updates ellipse radii and line stroke-width", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new EllipseShape("e1", 1, 2, 3, 4));
		doc.addRootShape(new LineShape("ln", 0, 0, 10, 10, "black"));
		store.setDocument(doc);

		assert.equal(
			new SetAttributeCommand(store, "e1", "rx", "5").execute(),
			"ellipse#e1 updated: rx=5",
		);
		assert.equal(
			new SetAttributeCommand(store, "ln", "stroke-width", "2").execute(),
			"line#ln updated: stroke-width=2",
		);
	});

	it("updates text position attributes", () => {
		const store = storeWithTitle();
		const command = new SetAttributeCommand(store, "title", "x", "30");

		assert.equal(command.execute(), "text#title updated: x=30");
		assert.equal((store.getDocument().findById("title") as TextShape).x, 30);
	});

	it("sets fill, stroke, and stroke-width on every leaf and keeps them visible", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new RectShape("r1", 0, 0, 10, 10));
		doc.addRootShape(new TextShape("t1", 1, 2, "hi"));
		doc.addRootShape(new LineShape("ln", 0, 0, 1, 1, "black"));
		store.setDocument(doc);

		assert.equal(
			new SetAttributeCommand(store, "r1", "stroke", "black").execute(),
			"rect#r1 updated: stroke=black",
		);
		assert.equal(
			new SetAttributeCommand(store, "r1", "stroke-width", "2").execute(),
			"rect#r1 updated: stroke-width=2",
		);
		assert.equal(
			new SetAttributeCommand(store, "t1", "fill", "red").execute(),
			"text#t1 updated: fill=red",
		);
		assert.equal(
			new SetAttributeCommand(store, "ln", "fill", "blue").execute(),
			"line#ln updated: fill=blue",
		);
		assert.equal(
			new SetAttributeCommand(store, "ln", "stroke-width", "3").execute(),
			"line#ln updated: stroke-width=3",
		);

		const shown = ShowFormatter.render(doc, "r1");
		assert.match(shown, /stroke=black/);
		assert.match(shown, /stroke-width=2/);

		const svg = SvgWriter.serialize(doc);
		assert.match(
			svg,
			/<rect id="r1" x="0" y="0" width="10" height="10" stroke="black" stroke-width="2"\/>/,
		);
		assert.match(svg, /<text id="t1" x="1" y="2" fill="red">hi<\/text>/);
		assert.match(
			svg,
			/<line id="ln" x1="0" y1="0" x2="1" y2="1" fill="blue" stroke="black" stroke-width="3"\/>/,
		);
	});

	it("rejects attributes outside the whitelist", () => {
		const store = new DocumentStore();
		const doc = new Document(800, 600);
		doc.addRootShape(new CircleShape("c1", 0, 0, 1));
		store.setDocument(doc);

		assert.equal(
			new SetAttributeCommand(store, "c1", "opacity", "0.5").execute(),
			"error: unknown attribute: opacity",
		);
	});
});

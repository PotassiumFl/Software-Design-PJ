import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { SvgWriter } from "../../src/io/SvgWriter.js";
import { Document } from "../../src/model/Document.js";
import { GroupShape } from "../../src/model/GroupShape.js";
import { LineShape } from "../../src/model/LineShape.js";
import { RectShape } from "../../src/model/RectShape.js";

function documentLikePhaseCliMinimal(): Document {
	const doc = new Document(400, 200);
	const flow = new GroupShape("flow");
	doc.addRootShape(flow);
	doc.addShapeToContainer(
		"flow",
		new RectShape("start", 30, 70, 120, 60, "#4a90d9"),
	);
	doc.addShapeToContainer(
		"flow",
		new LineShape("edge", 150, 100, 250, 100, "black"),
	);
	doc.addShapeToContainer(
		"flow",
		new RectShape("end", 250, 70, 120, 60, "#f5a623"),
	);
	return doc;
}

describe("SvgWriter", () => {
	it("serializes svg root and nested shapes from phase_cli_1 section 0.1", () => {
		const xml = SvgWriter.serialize(documentLikePhaseCliMinimal());

		assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
		assert.match(
			xml,
			/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="400" height="200" viewBox="0 0 400 200">/,
		);
		assert.match(
			xml,
			/<rect id="start" x="30" y="70" width="120" height="60" fill="#4a90d9"\/>/,
		);
		assert.match(
			xml,
			/<line id="edge" x1="150" y1="100" x2="250" y2="100" stroke="black"\/>/,
		);
		assert.match(xml, /<g id="flow">[\s\S]*<\/g>/);
	});

	it("writes a file that can be read back as UTF-8 text", async () => {
		const dir = await mkdtemp(path.join(os.tmpdir(), "svg-writer-"));
		const filePath = path.join(dir, "out.svg");
		const doc = documentLikePhaseCliMinimal();

		SvgWriter.writeFile(doc, filePath);

		const onDisk = await readFile(filePath, "utf8");
		assert.match(onDisk, /id="start"/);
		assert.match(onDisk, /id="flow"/);
	});
});

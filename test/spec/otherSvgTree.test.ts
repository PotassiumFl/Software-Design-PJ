import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { EditorSession } from "../../src/app/EditorSession.js";

const fixturesDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../fixtures/svg",
);

/** Root-level shape lines in phase_cli_1 section 6 after `read other.svg`. */
const EXPECTED_ROOT_SHAPE_SNIPPETS = [
	"rect#rect1",
	"text#t1",
	"circle#c1",
	"g#g1",
	"ellipse#e1",
] as const;

describe("phase_cli_1 other.svg tree (defect gap §2)", () => {
	it("renders section 6 root shapes in file order", () => {
		const session = new EditorSession();
		session.runRead(path.join(fixturesDir, "other.svg"));

		const tree = session.runTree();
		assert.match(tree, /^svg \(400x300\)/m);

		const positions = EXPECTED_ROOT_SHAPE_SNIPPETS.map((snippet) =>
			tree.indexOf(snippet),
		);
		assert.ok(positions.every((index) => index >= 0));
		for (let i = 1; i < positions.length; i++) {
			assert.ok(
				positions[i]! > positions[i - 1]!,
				`expected ${EXPECTED_ROOT_SHAPE_SNIPPETS[i - 1]} before ${EXPECTED_ROOT_SHAPE_SNIPPETS[i]} in tree`,
			);
		}

		assert.match(tree, /text#t1\s+\(10,290\)\s+"imported"/);
		assert.match(tree, /g#g1[\s\S]*rect#r2[\s\S]*circle#c2/);
	});
});

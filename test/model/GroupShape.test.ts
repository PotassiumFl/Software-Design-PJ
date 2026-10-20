import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GroupShape } from "../../src/model/GroupShape.js";
import { RectShape } from "../../src/model/RectShape.js";

describe("GroupShape", () => {
	it("starts empty and accepts children", () => {
		const group = new GroupShape("g1");
		assert.equal(group.getChildren().length, 0);

		const rect = new RectShape("r1", 0, 0, 10, 10);
		group.addChild(rect);

		assert.equal(group.getChildren().length, 1);
		assert.equal(group.getChildren()[0], rect);
	});
});

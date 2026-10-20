import { EditorSession } from "../app/EditorSession.js";
import { INVALID_ARGUMENTS } from "../command/CommandMessages.js";

import { HelpText } from "./HelpText.js";

/** 命令名 → 处理（待重构：集中分派点之一） */
export class CommandDispatcher {
	constructor(private readonly session: EditorSession) {}

	dispatch(tokens: string[]): string | null {
		if (tokens.length === 0) {
			return null;
		}

		const command = tokens[0]!;

		if (command === "help") {
			return HelpText.render();
		}

		if (command === "init") {
			const width = tokens.length >= 2 ? Number(tokens[1]) : 800;
			const height = tokens.length >= 3 ? Number(tokens[2]) : 600;
			return this.session.runInit(width, height);
		}

		if (command === "create") {
			return this.session.runCreate(tokens.slice(1));
		}

		if (command === "tree") {
			return this.session.runTree(tokens[1]);
		}

		if (command === "move") {
			const id = tokens[1];
			const dx = tokens.length >= 3 ? Number(tokens[2]) : Number.NaN;
			const dy = tokens.length >= 4 ? Number(tokens[3]) : Number.NaN;
			if (!id) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runMove(id, dx, dy);
		}

		if (command === "undo") {
			return this.session.runUndo();
		}

		if (command === "redo") {
			return this.session.runRedo();
		}

		if (command === "delete") {
			const id = tokens[1];
			if (!id) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runDelete(id);
		}

		if (command === "set") {
			const id = tokens[1];
			const attribute = tokens[2];
			const value = tokens[3];
			if (!id || attribute === undefined || value === undefined) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runSet(id, attribute, value);
		}

		if (command === "scale") {
			const id = tokens[1];
			const factor = tokens.length >= 3 ? Number(tokens[2]) : Number.NaN;
			if (!id) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runScale(id, factor);
		}

		if (command === "group") {
			const newGroupId = tokens[1];
			const memberIds = tokens.slice(2);
			if (!newGroupId || memberIds.length === 0) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runGroup(newGroupId, memberIds);
		}

		if (command === "ungroup") {
			const groupId = tokens[1];
			if (!groupId) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runUngroup(groupId);
		}

		if (command === "addto") {
			const containerId = tokens[1];
			const shapeId = tokens[2];
			if (!containerId || !shapeId) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runAddTo(containerId, shapeId);
		}

		if (command === "show") {
			const id = tokens[1];
			if (!id) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runShow(id);
		}

		if (command === "front" || command === "back") {
			const id = tokens[1];
			if (!id) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runZOrder(id, command);
		}

		if (command === "canvas") {
			if (tokens.length === 1) {
				return this.session.runCanvas();
			}
			if (tokens.length >= 3) {
				const width = Number(tokens[1]);
				const height = Number(tokens[2]);
				return this.session.runCanvas(width, height);
			}
			return INVALID_ARGUMENTS;
		}

		if (command === "read") {
			const filePath = tokens[1];
			if (!filePath) {
				return INVALID_ARGUMENTS;
			}
			return this.session.runRead(filePath);
		}

		if (command === "save") {
			const filePath = tokens[1];
			return this.session.runSave(filePath);
		}

		return `error: unknown command: ${command}`;
	}
}

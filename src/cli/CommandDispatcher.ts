import { EditorSession } from "../app/EditorSession.js";

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
			return this.session.runTree();
		}

		return `error: unknown command: ${command}`;
	}
}

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

		// 阶段 B 起：在此分支处理 init 等；需要画布时用 this.session
		return `error: unknown command: ${command}`;
	}
}

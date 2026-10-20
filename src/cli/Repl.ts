import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { EditorSession } from "../app/EditorSession.js";

import { CommandDispatcher } from "./CommandDispatcher.js";
import { CommandLineTokenizer } from "./CommandLineTokenizer.js";

const BANNER = "svg-editor 0.1 — type 'help' for commands";

export class Repl {
	private readonly dispatcher: CommandDispatcher;

	constructor(session = new EditorSession()) {
		this.dispatcher = new CommandDispatcher(session);
	}

	async run(): Promise<void> {
		console.log(BANNER);
		const rl = readline.createInterface({ input, output, terminal: true });

		try {
			while (true) {
				let line: string;
				try {
					line = await rl.question("svg> ");
				} catch {
					break;
				}

				const tokens = CommandLineTokenizer.tokenize(line);
				if (tokens.length === 0) {
					continue;
				}

				if (tokens[0] === "quit") {
					break;
				}

				const message = this.dispatcher.dispatch(tokens);
				if (message !== null) {
					console.log(message);
				}
			}
		} finally {
			rl.close();
		}
	}
}

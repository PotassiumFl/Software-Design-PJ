import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { CommandLineTokenizer } from "./CommandLineTokenizer.js";

export class Repl {
	async run(): Promise<void> {
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
			}
		} finally {
			rl.close();
		}
	}
}

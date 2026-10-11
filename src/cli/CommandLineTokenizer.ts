export class CommandLineTokenizer {
	static tokenize(line: string): string[] {
		const trimmed = line.trim();
		if (trimmed === "" || trimmed.startsWith("#")) {
			return [];
		}
		return tokenizeQuoted(trimmed);
	}
}

function tokenizeQuoted(input: string): string[] {
	const tokens: string[] = [];
	let i = 0;

	while (i < input.length) {
		while (i < input.length && /\s/.test(input[i]!)) {
			i++;
		}
		if (i >= input.length) {
			break;
		}

		if (input[i] === '"') {
			i++;
			let value = "";
			while (i < input.length && input[i] !== '"') {
				value += input[i];
				i++;
			}
			if (i < input.length && input[i] === '"') {
				i++;
			}
			tokens.push(value);
			continue;
		}

		let word = "";
		while (i < input.length && !/\s/.test(input[i]!)) {
			word += input[i];
			i++;
		}
		tokens.push(word);
	}

	return tokens;
}

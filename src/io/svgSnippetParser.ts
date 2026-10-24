import { XMLParser } from "fast-xml-parser";

const PARSER = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	textNodeName: "#text",
	parseTagValue: true,
	trimValues: true,
});

const OPENING_TAG =
	/^<\s*(rect|circle|ellipse|line|text|g)\b[^>]*\/?>/i;

const ANY_OPEN = /^<\s*([a-zA-Z0-9:-]+)\b[^>]*\/?>/;
const ANY_CLOSE = /^<\/\s*([a-zA-Z0-9:-]+)\s*>/;

type CloseMatch = {
	closeStart: number;
	end: number;
};

/** Walks SVG text in document order, including nested groups. */
export class SvgSnippetParser {
	static extractDirectChildSnippets(parentContent: string): string[] {
		const snippets: string[] = [];
		let index = 0;

		while (index < parentContent.length) {
			while (
				index < parentContent.length &&
				/\s/.test(parentContent[index]!)
			) {
				index += 1;
			}
			if (index >= parentContent.length) {
				break;
			}
			if (parentContent[index] !== "<") {
				index += 1;
				continue;
			}

			const openMatch = parentContent.slice(index).match(OPENING_TAG);
			if (!openMatch) {
				index += 1;
				continue;
			}

			const openTag = openMatch[0];
			const tag = openTag.match(/^<\s*(\w+)/i)?.[1]?.toLowerCase();
			if (!tag) {
				index += 1;
				continue;
			}

			const openEnd = index + openTag.length;
			if (openTag.endsWith("/>")) {
				snippets.push(parentContent.slice(index, openEnd));
				index = openEnd;
				continue;
			}

			const close = SvgSnippetParser.findMatchingClose(
				parentContent,
				openEnd,
				tag,
			);
			if (!close) {
				break;
			}
			snippets.push(parentContent.slice(index, close.end));
			index = close.end;
		}

		return snippets;
	}

	static tagNameFromSnippet(snippet: string): string | undefined {
		const match = snippet.match(/^<\s*(rect|circle|ellipse|line|text|g)\b/i);
		return match?.[1]?.toLowerCase();
	}

	static innerContentFromGroupSnippet(snippet: string): string {
		const open = snippet.match(/^<\s*g\b[^>]*\/?>/i);
		if (!open || open[0].endsWith("/>")) {
			return "";
		}
		const close = SvgSnippetParser.findMatchingClose(
			snippet,
			open[0].length,
			"g",
		);
		if (!close) {
			return "";
		}
		return snippet.slice(open[0].length, close.closeStart);
	}

	static parseSnippetAttributes(snippet: string): Record<string, unknown> {
		const wrapped = `<wrap>${snippet}</wrap>`;
		const parsed = PARSER.parse(wrapped) as Record<string, unknown>;
		const wrap = parsed.wrap as Record<string, unknown> | undefined;
		const tag = SvgSnippetParser.tagNameFromSnippet(snippet);
		if (!tag || !wrap || wrap[tag] === undefined) {
			return {};
		}
		const entry = wrap[tag];
		return (Array.isArray(entry) ? entry[0] : entry) as Record<
			string,
			unknown
		>;
	}

	static extractSvgInnerContent(raw: string): string {
		const match = raw.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i);
		return match?.[1] ?? "";
	}

	/** End index of the close tag that matches the open tag ending at `openEnd`. */
	private static findMatchingClose(
		content: string,
		openEnd: number,
		tag: string,
	): CloseMatch | undefined {
		let depth = 1;
		let index = openEnd;

		while (index < content.length) {
			const next = content.indexOf("<", index);
			if (next < 0) {
				return undefined;
			}
			const rest = content.slice(next);
			const close = rest.match(ANY_CLOSE);
			if (close && close[1]!.toLowerCase() === tag) {
				depth -= 1;
				const end = next + close[0].length;
				if (depth === 0) {
					return { closeStart: next, end };
				}
				index = end;
				continue;
			}
			const open = rest.match(ANY_OPEN);
			if (
				open &&
				open[1]!.toLowerCase() === tag &&
				!open[0].endsWith("/>")
			) {
				depth += 1;
				index = next + open[0].length;
				continue;
			}
			index = next + 1;
		}

		return undefined;
	}
}

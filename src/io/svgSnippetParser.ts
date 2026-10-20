import { XMLParser } from "fast-xml-parser";

type ParsedNode = Record<string, unknown>;

const PARSER = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	textNodeName: "#text",
	parseTagValue: true,
	trimValues: true,
});

const OPENING_TAG =
	/^<\s*(rect|circle|ellipse|line|text|g)\b[^>]*\/?>/i;

export function extractDirectChildSnippets(parentContent: string): string[] {
	const snippets: string[] = [];
	let index = 0;

	while (index < parentContent.length) {
		while (index < parentContent.length && /\s/.test(parentContent[index]!)) {
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

		const closeToken = `</${tag}>`;
		const closeIndex = parentContent
			.toLowerCase()
			.indexOf(closeToken, openEnd);
		if (closeIndex < 0) {
			break;
		}
		const end = closeIndex + closeToken.length;
		snippets.push(parentContent.slice(index, end));
		index = end;
	}

	return snippets;
}

export function tagNameFromSnippet(snippet: string): string | undefined {
	const match = snippet.match(/^<\s*(rect|circle|ellipse|line|text|g)\b/i);
	return match?.[1]?.toLowerCase();
}

export function innerContentFromGroupSnippet(snippet: string): string {
	const match = snippet.match(/^<\s*g\b[^>]*>([\s\S]*)<\/g>\s*$/i);
	return match?.[1] ?? "";
}

export function parseSnippetAttributes(snippet: string): ParsedNode {
	const wrapped = `<wrap>${snippet}</wrap>`;
	const parsed = PARSER.parse(wrapped) as ParsedNode;
	const wrap = parsed.wrap as ParsedNode;
	const tag = tagNameFromSnippet(snippet);
	if (!tag || !wrap[tag]) {
		return {};
	}
	const entry = wrap[tag];
	return (Array.isArray(entry) ? entry[0] : entry) as ParsedNode;
}

export function extractSvgInnerContent(raw: string): string {
	const match = raw.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i);
	return match?.[1] ?? "";
}

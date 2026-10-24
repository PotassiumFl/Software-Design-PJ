import { readFileSync } from "node:fs";
import path from "node:path";

import { XMLParser } from "fast-xml-parser";

import { Document } from "../model/Document.js";
import type { Shape } from "../model/Shape.js";
import {
	type SvgAttributeReader,
	ShapeRegistry,
} from "../model/ShapeRegistry.js";

import { SvgSnippetParser } from "./SvgSnippetParser.js";

export type SvgReadResult = {
	document?: Document;
	warnings: string[];
	elementCount: number;
	error?: string;
};

type ParsedNode = Record<string, unknown>;

export class SvgReader {
	private static readonly registry = new ShapeRegistry();

	static readFile(filePath: string): SvgReadResult {
		const baseName = path.basename(filePath);
		let raw: string;
		try {
			raw = readFileSync(filePath, "utf8");
		} catch {
			return {
				warnings: [],
				elementCount: 0,
				error: `error: cannot read file: ${baseName}`,
			};
		}

		return SvgReader.parseSvg(raw);
	}

	static parseSvg(raw: string): SvgReadResult {
		const parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: "@_",
			textNodeName: "#text",
			parseTagValue: true,
			trimValues: true,
		});

		const parsed = parser.parse(raw) as ParsedNode;
		const svgNode = parsed.svg as ParsedNode | undefined;
		if (!svgNode) {
			return {
				warnings: [],
				elementCount: 0,
				error: "error: invalid svg document",
			};
		}

		const width = SvgReader.numberAttr(svgNode, "width", 800);
		const height = SvgReader.numberAttr(svgNode, "height", 600);
		const document = new Document(width, height);
		const warnings: string[] = [];
		const idCounters = new Map<string, number>();

		SvgReader.loadOrderedChildren(
			document,
			SvgSnippetParser.extractSvgInnerContent(raw),
			warnings,
			idCounters,
		);

		return {
			document,
			warnings,
			elementCount: document.countElements(),
		};
	}

	private static loadOrderedChildren(
		document: Document,
		content: string,
		warnings: string[],
		idCounters: Map<string, number>,
	): void {
		for (const snippet of SvgSnippetParser.extractDirectChildSnippets(content)) {
			const shape = SvgReader.parseSnippet(snippet, warnings, idCounters);
			if (!shape) {
				continue;
			}
			document.addRootShape(shape);
		}
	}

	private static loadOrderedGroupChildren(
		group: Shape,
		content: string,
		warnings: string[],
		idCounters: Map<string, number>,
	): void {
		for (const snippet of SvgSnippetParser.extractDirectChildSnippets(content)) {
			const shape = SvgReader.parseSnippet(snippet, warnings, idCounters);
			if (!shape) {
				continue;
			}
			group.addChild(shape);
		}
	}

	private static parseSnippet(
		snippet: string,
		warnings: string[],
		idCounters: Map<string, number>,
	): Shape | null {
		const tag = SvgSnippetParser.tagNameFromSnippet(snippet);
		if (!tag) {
			return null;
		}
		const node = SvgSnippetParser.parseSnippetAttributes(snippet);
		if (tag === "text" && snippet.includes(">")) {
			const textMatch = snippet.match(/>([^<]*)<\//);
			if (textMatch) {
				node["#text"] = textMatch[1];
			}
		}

		let id = SvgReader.stringAttr(node, "id");
		if (!id) {
			const next = (idCounters.get(tag) ?? 0) + 1;
			idCounters.set(tag, next);
			id = `${tag}${next}`;
			warnings.push(
				`warning: assigned id ${id} to unnamed <${tag}>`,
			);
		}

		const attrs: SvgAttributeReader = {
			number: (name, defaultValue) =>
				SvgReader.numberAttr(node, name, defaultValue),
			optionalString: (name) => SvgReader.optionalStringAttr(node, name),
			optionalNumber: (name) => SvgReader.optionalNumberAttr(node, name),
			textContent: () =>
				typeof node["#text"] === "string"
					? node["#text"]
					: String(node["#text"] ?? ""),
		};

		const shape = SvgReader.registry.createFromSvgTag(tag, id, attrs);
		if (!shape) {
			return null;
		}

		if (shape.isComposite()) {
			SvgReader.loadOrderedGroupChildren(
				shape,
				SvgSnippetParser.innerContentFromGroupSnippet(snippet),
				warnings,
				idCounters,
			);
		}

		return shape;
	}

	private static stringAttr(node: ParsedNode, name: string): string | undefined {
		const value = node[`@_${name}`];
		if (value === undefined || value === null) {
			return undefined;
		}
		return String(value);
	}

	private static optionalStringAttr(
		node: ParsedNode,
		name: string,
	): string | undefined {
		return SvgReader.stringAttr(node, name);
	}

	private static optionalNumberAttr(
		node: ParsedNode,
		name: string,
	): number | undefined {
		const raw = SvgReader.stringAttr(node, name);
		if (raw === undefined) {
			return undefined;
		}
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? parsed : undefined;
	}

	private static numberAttr(
		node: ParsedNode,
		name: string,
		defaultValue: number,
	): number {
		const raw = SvgReader.stringAttr(node, name);
		if (raw === undefined) {
			return defaultValue;
		}
		const parsed = Number(raw);
		return Number.isFinite(parsed) ? parsed : defaultValue;
	}
}

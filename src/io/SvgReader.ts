import { readFileSync } from "node:fs";
import path from "node:path";

import { XMLParser } from "fast-xml-parser";

import { CircleShape } from "../model/CircleShape.js";
import { Document } from "../model/Document.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { GroupShape } from "../model/GroupShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import type { Shape } from "../model/Shape.js";
import { TextShape } from "../model/TextShape.js";

import { countDocumentElements } from "./documentShapeCount.js";

export type SvgReadResult = {
	document?: Document;
	warnings: string[];
	elementCount: number;
	error?: string;
};

type ParsedNode = Record<string, unknown>;

const SHAPE_TAGS = [
	"rect",
	"circle",
	"ellipse",
	"line",
	"text",
	"g",
] as const;

export class SvgReader {
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

		SvgReader.loadChildren(document, svgNode, warnings, idCounters);

		return {
			document,
			warnings,
			elementCount: countDocumentElements(document),
		};
	}

	private static loadChildren(
		document: Document,
		node: ParsedNode,
		warnings: string[],
		idCounters: Map<string, number>,
	): void {
		for (const tag of SHAPE_TAGS) {
			const entry = node[tag];
			if (entry === undefined) {
				continue;
			}
			const elements = Array.isArray(entry) ? entry : [entry];
			for (const element of elements) {
				const shape = SvgReader.parseElement(
					tag,
					element as ParsedNode,
					warnings,
					idCounters,
				);
				if (shape) {
					document.addRootShape(shape);
				}
			}
		}
	}

	private static parseElement(
		tag: string,
		node: ParsedNode,
		warnings: string[],
		idCounters: Map<string, number>,
	): Shape | null {
		let id = SvgReader.stringAttr(node, "id");
		if (!id) {
			const next = (idCounters.get(tag) ?? 0) + 1;
			idCounters.set(tag, next);
			id = `${tag}${next}`;
			warnings.push(
				`warning: assigned id ${id} to unnamed <${tag}>`,
			);
		}

		if (tag === "rect") {
			return new RectShape(
				id,
				SvgReader.numberAttr(node, "x", 0),
				SvgReader.numberAttr(node, "y", 0),
				SvgReader.numberAttr(node, "width", 0),
				SvgReader.numberAttr(node, "height", 0),
				SvgReader.optionalStringAttr(node, "fill"),
			);
		}

		if (tag === "circle") {
			return new CircleShape(
				id,
				SvgReader.numberAttr(node, "cx", 0),
				SvgReader.numberAttr(node, "cy", 0),
				SvgReader.numberAttr(node, "r", 0),
				SvgReader.optionalStringAttr(node, "fill"),
			);
		}

		if (tag === "ellipse") {
			return new EllipseShape(
				id,
				SvgReader.numberAttr(node, "cx", 0),
				SvgReader.numberAttr(node, "cy", 0),
				SvgReader.numberAttr(node, "rx", 0),
				SvgReader.numberAttr(node, "ry", 0),
				SvgReader.optionalStringAttr(node, "fill"),
			);
		}

		if (tag === "line") {
			return new LineShape(
				id,
				SvgReader.numberAttr(node, "x1", 0),
				SvgReader.numberAttr(node, "y1", 0),
				SvgReader.numberAttr(node, "x2", 0),
				SvgReader.numberAttr(node, "y2", 0),
				SvgReader.optionalStringAttr(node, "stroke"),
			);
		}

		if (tag === "text") {
			const content =
				typeof node["#text"] === "string"
					? node["#text"]
					: String(node["#text"] ?? "");
			return new TextShape(
				id,
				SvgReader.numberAttr(node, "x", 0),
				SvgReader.numberAttr(node, "y", 0),
				content,
			);
		}

		if (tag === "g") {
			const group = new GroupShape(id);
			const childNode = { ...node };
			delete childNode["@_id"];
			SvgReader.loadGroupChildren(
				group,
				childNode,
				warnings,
				idCounters,
			);
			return group;
		}

		return null;
	}

	private static loadGroupChildren(
		group: GroupShape,
		node: ParsedNode,
		warnings: string[],
		idCounters: Map<string, number>,
	): void {
		for (const tag of SHAPE_TAGS) {
			const entry = node[tag];
			if (entry === undefined) {
				continue;
			}
			const elements = Array.isArray(entry) ? entry : [entry];
			for (const element of elements) {
				const shape = SvgReader.parseElement(
					tag,
					element as ParsedNode,
					warnings,
					idCounters,
				);
				if (shape) {
					group.addChild(shape);
				}
			}
		}
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

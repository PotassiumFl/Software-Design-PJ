import { writeFileSync } from "node:fs";

import { CircleShape } from "../model/CircleShape.js";
import { Document } from "../model/Document.js";
import { EllipseShape } from "../model/EllipseShape.js";
import { GroupShape } from "../model/GroupShape.js";
import { LineShape } from "../model/LineShape.js";
import { RectShape } from "../model/RectShape.js";
import type { Shape } from "../model/Shape.js";
import { TextShape } from "../model/TextShape.js";

export class SvgWriter {
	static serialize(document: Document): string {
		const lines: string[] = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			`<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`,
		];

		for (const shape of document.getRootShapes()) {
			lines.push(...SvgWriter.serializeShape(shape, "  "));
		}

		lines.push("</svg>");
		return lines.join("\n");
	}

	static writeFile(document: Document, filePath: string): void {
		writeFileSync(filePath, SvgWriter.serialize(document), "utf8");
	}

	private static serializeShape(shape: Shape, indent: string): string[] {
		if (shape instanceof GroupShape) {
			const lines = [`${indent}<g id="${shape.id}">`];
			for (const child of shape.getChildren()) {
				lines.push(...SvgWriter.serializeShape(child, `${indent}  `));
			}
			lines.push(`${indent}</g>`);
			return lines;
		}

		if (shape instanceof RectShape) {
			const fill =
				shape.fill !== undefined ? ` fill="${shape.fill}"` : "";
			return [
				`${indent}<rect id="${shape.id}" x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${fill}/>`,
			];
		}

		if (shape instanceof CircleShape) {
			const fill =
				shape.fill !== undefined ? ` fill="${shape.fill}"` : "";
			return [
				`${indent}<circle id="${shape.id}" cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}"${fill}/>`,
			];
		}

		if (shape instanceof EllipseShape) {
			const fill =
				shape.fill !== undefined ? ` fill="${shape.fill}"` : "";
			return [
				`${indent}<ellipse id="${shape.id}" cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}"${fill}/>`,
			];
		}

		if (shape instanceof LineShape) {
			const stroke =
				shape.stroke !== undefined
					? ` stroke="${shape.stroke}"`
					: "";
			return [
				`${indent}<line id="${shape.id}" x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}"${stroke}/>`,
			];
		}

		if (shape instanceof TextShape) {
			return [
				`${indent}<text id="${shape.id}" x="${shape.x}" y="${shape.y}">${SvgWriter.escapeText(shape.content)}</text>`,
			];
		}

		return [];
	}

	private static escapeText(content: string): string {
		return content
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
}

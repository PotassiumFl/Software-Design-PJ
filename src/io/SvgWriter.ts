import { writeFileSync } from "node:fs";

import { Document } from "../model/Document.js";

export class SvgWriter {
	static serialize(document: Document): string {
		const lines: string[] = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			`<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`,
		];

		for (const shape of document.getRootShapes()) {
			lines.push(...shape.serializeSvg("  "));
		}

		lines.push("</svg>");
		return lines.join("\n");
	}

	static writeFile(document: Document, filePath: string): void {
		writeFileSync(filePath, SvgWriter.serialize(document), "utf8");
	}
}

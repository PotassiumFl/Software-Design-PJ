import { Document } from "../model/Document.js";
import { DocumentStore } from "../model/DocumentStore.js";

import type { EditorCommand } from "./EditorCommand.js";

export class InitDocumentCommand implements EditorCommand {
	constructor(
		private readonly store: DocumentStore,
		private readonly width: number,
		private readonly height: number,
	) {}

	execute(): string {
		this.store.setDocument(new Document(this.width, this.height));
		return `canvas ${this.width}x${this.height} created`;
	}
}

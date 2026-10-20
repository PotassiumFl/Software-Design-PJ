import { Document } from "./Document.js";

export class DocumentStore {
	private document: Document | null = null;

	hasDocument(): boolean {
		return this.document !== null;
	}

	setDocument(document: Document): void {
		this.document = document;
	}

	getDocument(): Document {
		if (!this.document) {
			throw new Error("no document. use 'init' or 'read' first");
		}
		return this.document;
	}
}

import { InitDocumentCommand } from "../command/InitDocumentCommand.js";
import { DocumentStore } from "../model/DocumentStore.js";

export class EditorSession {
	private readonly documentStore = new DocumentStore();

	get hasDocument(): boolean {
		return this.documentStore.hasDocument();
	}

	noDocumentMessage(): string {
		return "error: no document. use 'init' or 'read' first";
	}

	runInit(width = 800, height = 600): string {
		return new InitDocumentCommand(
			this.documentStore,
			width,
			height,
		).execute();
	}
}

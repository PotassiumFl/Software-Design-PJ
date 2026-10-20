import { CreateShapeCommand } from "../command/CreateShapeCommand.js";
import { InitDocumentCommand } from "../command/InitDocumentCommand.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";
import { TreeFormatter } from "../cli/TreeFormatter.js";

export class EditorSession {
	private readonly documentStore = new DocumentStore();
	private readonly shapeRegistry = new ShapeRegistry();

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

	runCreate(shapeTokens: string[]): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return new CreateShapeCommand(
			this.documentStore,
			this.shapeRegistry,
			shapeTokens,
		).execute();
	}

	runTree(): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return TreeFormatter.render(this.documentStore.getDocument());
	}
}

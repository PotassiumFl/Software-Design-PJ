import { CommandHistory } from "./CommandHistory.js";
import { CreateShapeCommand } from "../command/CreateShapeCommand.js";
import { InitDocumentCommand } from "../command/InitDocumentCommand.js";
import { MoveShapeCommand } from "../command/MoveShapeCommand.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";
import { TreeFormatter } from "../cli/TreeFormatter.js";

export class EditorSession {
	private readonly documentStore = new DocumentStore();
	private readonly shapeRegistry = new ShapeRegistry();
	private readonly commandHistory = new CommandHistory();

	get hasDocument(): boolean {
		return this.documentStore.hasDocument();
	}

	noDocumentMessage(): string {
		return "error: no document. use 'init' or 'read' first";
	}

	runInit(width = 800, height = 600): string {
		this.commandHistory.clear();
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
		return this.commandHistory.execute(
			new CreateShapeCommand(
				this.documentStore,
				this.shapeRegistry,
				shapeTokens,
			),
		);
	}

	runMove(shapeId: string, dx: number, dy: number): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new MoveShapeCommand(this.documentStore, shapeId, dx, dy),
		);
	}

	runUndo(): string {
		return this.commandHistory.undo();
	}

	runRedo(): string {
		return this.commandHistory.redo();
	}

	runTree(): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return TreeFormatter.render(this.documentStore.getDocument());
	}
}

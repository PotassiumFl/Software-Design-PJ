import { CommandHistory } from "./CommandHistory.js";
import { CreateShapeCommand } from "../command/CreateShapeCommand.js";
import { InitDocumentCommand } from "../command/InitDocumentCommand.js";
import { AddToCommand } from "../command/AddToCommand.js";
import { DeleteShapeCommand } from "../command/DeleteShapeCommand.js";
import { GroupCommand } from "../command/GroupCommand.js";
import { UngroupCommand } from "../command/UngroupCommand.js";
import { MoveShapeCommand } from "../command/MoveShapeCommand.js";
import { ScaleShapeCommand } from "../command/ScaleShapeCommand.js";
import { SetAttributeCommand } from "../command/SetAttributeCommand.js";
import { ResizeCanvasCommand } from "../command/ResizeCanvasCommand.js";
import { ZOrderCommand } from "../command/ZOrderCommand.js";
import type { ZOrderDirection } from "../command/ZOrderCommand.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";
import { ShowFormatter } from "../cli/ShowFormatter.js";
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

	runDelete(shapeId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new DeleteShapeCommand(this.documentStore, shapeId),
		);
	}

	runSet(shapeId: string, attribute: string, value: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new SetAttributeCommand(
				this.documentStore,
				shapeId,
				attribute,
				value,
			),
		);
	}

	runScale(shapeId: string, factor: number): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new ScaleShapeCommand(this.documentStore, shapeId, factor),
		);
	}

	runGroup(newGroupId: string, memberIds: string[]): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new GroupCommand(this.documentStore, newGroupId, ...memberIds),
		);
	}

	runUngroup(groupId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new UngroupCommand(this.documentStore, groupId),
		);
	}

	runAddTo(containerId: string, shapeId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new AddToCommand(this.documentStore, containerId, shapeId),
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

	runShow(shapeId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return ShowFormatter.render(this.documentStore.getDocument(), shapeId);
	}

	runZOrder(shapeId: string, direction: ZOrderDirection): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.commandHistory.execute(
			new ZOrderCommand(this.documentStore, shapeId, direction),
		);
	}

	runCanvas(width?: number, height?: number): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		const document = this.documentStore.getDocument();
		if (width === undefined || height === undefined) {
			return `canvas ${document.width}x${document.height}`;
		}
		return this.commandHistory.execute(
			new ResizeCanvasCommand(this.documentStore, width, height),
		);
	}
}

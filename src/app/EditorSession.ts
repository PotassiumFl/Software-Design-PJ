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
import type { UndoableCommand } from "../command/UndoableCommand.js";
import {
	NO_SAVE_PATH,
	UNDO_NOT_ALLOWED_AFTER_IO,
} from "../command/CommandMessages.js";
import { countDocumentElements } from "../io/documentShapeCount.js";
import { SvgReader } from "../io/SvgReader.js";
import { SvgWriter } from "../io/SvgWriter.js";
import { DocumentStore } from "../model/DocumentStore.js";
import { ShapeRegistry } from "../model/ShapeRegistry.js";
import { ShowFormatter } from "../cli/ShowFormatter.js";
import { TreeFormatter } from "../cli/TreeFormatter.js";
import path from "node:path";

export class EditorSession {
	private readonly documentStore = new DocumentStore();
	private readonly shapeRegistry = new ShapeRegistry();
	private readonly commandHistory = new CommandHistory();
	/** Path from the last successful read or explicit save (for bare `save`). */
	private lastSavePath: string | null = null;
	private ioLocked = false;
	private ioLockedAfterRead = false;

	get hasDocument(): boolean {
		return this.documentStore.hasDocument();
	}

	noDocumentMessage(): string {
		return "error: no document. use 'init' or 'read' first";
	}

	runInit(width = 800, height = 600): string {
		this.commandHistory.clear();
		this.lastSavePath = null;
		const result = new InitDocumentCommand(
			this.documentStore,
			width,
			height,
		).execute();
		this.markIoCommand(false);
		return result;
	}

	runCreate(shapeTokens: string[]): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.runEdit(
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
		return this.runEdit(
			new MoveShapeCommand(this.documentStore, shapeId, dx, dy),
		);
	}

	runDelete(shapeId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.runEdit(
			new DeleteShapeCommand(this.documentStore, shapeId),
		);
	}

	runSet(shapeId: string, attribute: string, value: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.runEdit(
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
		return this.runEdit(
			new ScaleShapeCommand(this.documentStore, shapeId, factor),
		);
	}

	runGroup(newGroupId: string, memberIds: string[]): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.runEdit(
			new GroupCommand(this.documentStore, newGroupId, ...memberIds),
		);
	}

	runUngroup(groupId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.runEdit(
			new UngroupCommand(this.documentStore, groupId),
		);
	}

	runAddTo(containerId: string, shapeId: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}
		return this.runEdit(
			new AddToCommand(this.documentStore, containerId, shapeId),
		);
	}

	runUndo(): string {
		if (this.ioLocked) {
			return UNDO_NOT_ALLOWED_AFTER_IO;
		}
		return this.commandHistory.undo();
	}

	runRedo(): string {
		if (this.ioLocked) {
			return UNDO_NOT_ALLOWED_AFTER_IO;
		}
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
		return this.runEdit(
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

		const result = new ResizeCanvasCommand(
			this.documentStore,
			width,
			height,
		).execute();
		if (!result.startsWith("error:")) {
			this.markIoCommand(false);
		}
		return result;
	}

	runRead(filePath: string): string {
		const result = SvgReader.readFile(filePath);
		if (result.error) {
			return result.error;
		}

		this.documentStore.setDocument(result.document!);
		this.commandHistory.clear();
		this.lastSavePath = filePath;
		this.markIoCommand(true);

		const baseName = path.basename(filePath);
		const summary = `read ${baseName} (${result.elementCount} elements)`;
		if (result.warnings.length === 0) {
			return summary;
		}
		return [...result.warnings, summary].join("\n");
	}

	runSave(filePath?: string): string {
		if (!this.hasDocument) {
			return this.noDocumentMessage();
		}

		const targetPath = filePath ?? this.lastSavePath;
		if (!targetPath) {
			return NO_SAVE_PATH;
		}

		const baseName = path.basename(targetPath);
		try {
			SvgWriter.writeFile(
				this.documentStore.getDocument(),
				targetPath,
			);
		} catch {
			return `error: cannot write file: ${baseName}`;
		}

		this.lastSavePath = targetPath;
		this.markIoCommand(false);
		const count = countDocumentElements(this.documentStore.getDocument());
		return `saved to ${baseName} (${count} elements)`;
	}

	private runEdit(command: UndoableCommand): string {
		const result = this.commandHistory.execute(command);
		if (!result.startsWith("error:")) {
			this.clearIoLockAfterEdit();
		}
		return result;
	}

	private markIoCommand(afterRead: boolean): void {
		this.ioLocked = true;
		this.ioLockedAfterRead = afterRead;
	}

	private clearIoLockAfterEdit(): void {
		if (!this.ioLockedAfterRead) {
			this.ioLocked = false;
		}
	}
}

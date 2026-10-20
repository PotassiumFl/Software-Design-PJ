import type { EditorCommand } from "./EditorCommand.js";

export interface UndoableCommand extends EditorCommand {
	undo(): string;
	redo(): string;
}

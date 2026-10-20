import type { UndoableCommand } from "../command/UndoableCommand.js";

export class CommandHistory {
	private readonly undoStack: UndoableCommand[] = [];
	private readonly redoStack: UndoableCommand[] = [];

	execute(command: UndoableCommand): string {
		const result = command.execute();
		if (result.startsWith("error:")) {
			return result;
		}
		this.undoStack.push(command);
		this.redoStack.length = 0;
		return result;
	}

	undo(): string {
		const command = this.undoStack.pop();
		if (!command) {
			return "error: nothing to undo";
		}
		this.redoStack.push(command);
		return command.undo();
	}

	redo(): string {
		const command = this.redoStack.pop();
		if (!command) {
			return "error: nothing to redo";
		}
		this.undoStack.push(command);
		return command.redo();
	}

	clear(): void {
		this.undoStack.length = 0;
		this.redoStack.length = 0;
	}
}

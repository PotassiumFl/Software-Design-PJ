export class EditorSession {
	get hasDocument(): boolean {
		return false;
	}

	noDocumentMessage(): string {
		return "error: no document. use 'init' or 'read' first";
	}
}

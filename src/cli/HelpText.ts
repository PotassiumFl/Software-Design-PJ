export class HelpText {
	static render(): string {
		return [
			"init [w] [h]     — new canvas (default 800×600)",
			"read <file.svg>  — load SVG",
			"save [file.svg]  — save SVG",
			"canvas [w] [h]   — show or resize canvas",
			"create …         — create shape",
			"delete <id>      — delete shape",
			"move <id> dx dy  — move shape",
			"scale <id> f     — scale shape",
			"set <id> attr v  — set attribute",
			"group …          — group shapes",
			"ungroup <gid>    — ungroup",
			"addto <gid> <id> — move into group",
			"front/back <id>  — z-order",
			"tree [id]        — structure tree",
			"show <id>        — shape details",
			"undo / redo      — edit history",
			"help             — this message",
			"quit             — exit",
		].join("\n");
	}
}

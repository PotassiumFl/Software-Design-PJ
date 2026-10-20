import { DocumentStore } from "../model/DocumentStore.js";
import { GroupShape } from "../model/GroupShape.js";
import type { Shape } from "../model/Shape.js";

import type { UndoableCommand } from "./UndoableCommand.js";

export class GroupCommand implements UndoableCommand {
	constructor(
		private readonly store: DocumentStore,
		private readonly newGroupId: string,
		...memberIds: string[]
	) {
		this.memberIds = memberIds;
	}

	private readonly memberIds: string[];

	execute(): string {
		const document = this.store.getDocument();

		if (document.findById(this.newGroupId)) {
			return `error: id already exists: ${this.newGroupId}`;
		}

		const members: Shape[] = [];
		for (const memberId of this.memberIds) {
			const shape = document.findById(memberId);
			if (!shape) {
				return `error: no such shape: ${memberId}`;
			}
			members.push(shape);
		}

		for (const memberId of this.memberIds) {
			for (const otherId of this.memberIds) {
				if (
					memberId !== otherId &&
					document.isDescendantOf(memberId, otherId)
				) {
					return `error: cannot group a container into its own descendant: ${memberId}`;
				}
			}
		}

		let insertIndex = document.getRootShapes().length;
		for (const member of members) {
			const parent = document.findParentContainer(member);
			if (parent === null) {
				insertIndex = Math.min(insertIndex, document.getRootIndex(member));
			}
		}

		const group = new GroupShape(this.newGroupId);
		document.insertRootShapeAt(insertIndex, group);
		for (const member of members) {
			document.reparentExistingShapeToContainer(this.newGroupId, member);
		}

		return `g#${this.newGroupId} created with ${members.length} children`;
	}

	undo(): string {
		return "error: nothing to undo";
	}

	redo(): string {
		return "error: nothing to redo";
	}
}

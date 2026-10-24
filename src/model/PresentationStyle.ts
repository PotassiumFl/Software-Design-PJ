import type { AttributeUpdateResult } from "./Shape.js";

/** fill / stroke / stroke-width shared by every leaf shape. */
export class PresentationStyle {
	private _fill?: string;
	private _stroke?: string;
	private _strokeWidth?: number;

	constructor(fill?: string, stroke?: string, strokeWidth?: number) {
		this._fill = fill;
		this._stroke = stroke;
		this._strokeWidth = strokeWidth;
	}

	get fill(): string | undefined {
		return this._fill;
	}

	get stroke(): string | undefined {
		return this._stroke;
	}

	get strokeWidth(): number | undefined {
		return this._strokeWidth;
	}

	/**
	 * Handles the common set whitelist. Returns undefined when `attribute`
	 * is not fill, stroke, or stroke-width.
	 * An empty value clears the attribute so undo can restore "omitted".
	 */
	trySet(
		typeLabel: string,
		shapeId: string,
		attribute: string,
		value: string,
	): AttributeUpdateResult | undefined {
		if (attribute === "fill" || attribute === "stroke") {
			const previous =
				attribute === "fill" ? this._fill : this._stroke;
			const previousValue = String(previous ?? "");
			const next = value === "" ? undefined : value;
			if (attribute === "fill") {
				this._fill = next;
			} else {
				this._stroke = next;
			}
			return {
				ok: true,
				previousValue,
				message: `${typeLabel}#${shapeId} updated: ${attribute}=${value}`,
			};
		}

		if (attribute === "stroke-width") {
			if (value === "") {
				const previousValue = String(this._strokeWidth ?? "");
				this._strokeWidth = undefined;
				return {
					ok: true,
					previousValue,
					message: `${typeLabel}#${shapeId} updated: stroke-width=`,
				};
			}
			const parsed = Number(value);
			if (!Number.isFinite(parsed)) {
				return {
					ok: false,
					error: "error: unknown attribute: stroke-width",
				};
			}
			const previousValue = String(this._strokeWidth ?? "");
			this._strokeWidth = parsed;
			return {
				ok: true,
				previousValue,
				message: `${typeLabel}#${shapeId} updated: stroke-width=${value}`,
			};
		}

		return undefined;
	}

	/** Leading space plus any set paint attributes, or "". */
	treeSuffix(): string {
		const parts: string[] = [];
		if (this._fill !== undefined) {
			parts.push(`fill=${this._fill}`);
		}
		if (this._stroke !== undefined) {
			parts.push(`stroke=${this._stroke}`);
		}
		if (this._strokeWidth !== undefined) {
			parts.push(`stroke-width=${this._strokeWidth}`);
		}
		return parts.length === 0 ? "" : ` ${parts.join(" ")}`;
	}

	showLines(): string[] {
		const lines: string[] = [];
		if (this._fill !== undefined) {
			lines.push(`  fill=${this._fill}`);
		}
		if (this._stroke !== undefined) {
			lines.push(`  stroke=${this._stroke}`);
		}
		if (this._strokeWidth !== undefined) {
			lines.push(`  stroke-width=${this._strokeWidth}`);
		}
		return lines;
	}

	svgAttributes(): string {
		let attrs = "";
		if (this._fill !== undefined) {
			attrs += ` fill="${this._fill}"`;
		}
		if (this._stroke !== undefined) {
			attrs += ` stroke="${this._stroke}"`;
		}
		if (this._strokeWidth !== undefined) {
			attrs += ` stroke-width="${this._strokeWidth}"`;
		}
		return attrs;
	}
}

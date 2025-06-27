/**
 * Replay file parsing utilities
 * Based on the Python implementation in replay.py
 */

import { parseFString, sizeofFString, parseFDateTime } from './ue4';

/**
 * Enum for InfoBlock types
 */
export enum InfoBlockType {
	GameInfo = 0x00,
	GameSomething1 = 0x01,
	CommentBlock = 0x02,
	GameEvent = 0x03
}

/**
 * TickEvent class - represents a tick event in the replay
 */
export class TickEvent {
	public one: number;
	public unknown: number;
	public tickFrom: number;
	public tickTo: number;
	public unknownNumber1: number;
	public unknownNumber2: number;
	public padding: Uint8Array;
	public bytes: Uint8Array;
	private startOffset: number;
	private endOffset: number;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.startOffset = offset;

		this.one = view.getUint32(offset, true);
		this.unknown = view.getUint32(offset + 4, true);
		this.tickFrom = view.getUint32(offset + 8, true);
		this.tickTo = view.getUint32(offset + 12, true);
		this.unknownNumber1 = view.getUint32(offset + 16, true);
		this.unknownNumber2 = view.getUint32(offset + 20, true);
		this.padding = new Uint8Array(data, offset + 24, 4);
		this.endOffset = offset + 28;
		this.bytes = new Uint8Array(data, offset, this.endOffset - this.startOffset);
	}

	getSize(): number {
		return this.endOffset - this.startOffset;
	}

	toString(): string {
		return `TickEvent(one=${this.one}, unknown=${this.unknown}, tickFrom=${this.tickFrom}, tickTo=${this.tickTo})`;
	}
}

/**
 * Property class - represents a property in the replay
 */
export class Property {
	public tag: number;
	public type: number;
	public one?: number;
	public payload?: Uint8Array;
	public payload2?: Uint8Array;
	public key: string;
	public padding: Uint8Array;
	public bytes: Uint8Array;
	private startOffset: number;
	private endOfPayload: number;
	private endOffset: number;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.startOffset = offset;
		let cursor = offset;

		// Parse tag first
		this.tag = view.getUint8(cursor);
		cursor += 1;

		// Parse type
		this.type = view.getUint8(cursor);
		cursor += 1;

		// Conditional parsing based on type
		if (this.type === 0x00) {
			// Numeric value - variable length payload
			this.one = view.getUint8(cursor);
			cursor += 1;

			// Parse variable-length payload until terminator
			const payloadStart = cursor;
			while (cursor < data.byteLength && view.getUint8(cursor) !== 0x00) {
				cursor += 1;
			}
			this.payload = new Uint8Array(data, payloadStart, cursor - payloadStart);
			cursor += 1; // Skip terminator

			// Check for double tag logic
			if (this.payload.length > 0 && this.payload[this.payload.length - 1] === this.tag) {
				// Found double tag - parse additional payload
				const payload2Start = cursor;
				while (cursor < data.byteLength && view.getUint8(cursor) !== 0x00) {
					cursor += 1;
				}
				this.payload2 = new Uint8Array(data, payload2Start, cursor - payload2Start);
				cursor += 1; // Skip terminator_2
			}
		} else if (this.type === 0x02) {
			// FString payload
			this.payload = new TextEncoder().encode(parseFString(data, cursor));
			cursor += sizeofFString(data, cursor);

			// Parse number_changes_a_lot
			const numberChangesALot = view.getUint8(cursor);
			cursor += 1;

			// Parse one_or_two
			const oneOrTwo = view.getUint8(cursor);
			cursor += 1;

			// Parse maybe_zero
			const maybeZero = view.getUint8(cursor);
			cursor += 1;

			// Parse variable-length seq until terminator
			const seqStart = cursor;
			while (cursor < data.byteLength && view.getUint8(cursor) !== 0x00) {
				cursor += 1;
			}
			const seq = new Uint8Array(data, seqStart, cursor - seqStart);
			cursor += 1; // Skip terminator

			// Check if last byte of seq equals tag
			if (seq.length > 0 && seq[seq.length - 1] === this.tag) {
				// Parse seq_2
				const seq2Start = cursor;
				while (cursor < data.byteLength && view.getUint8(cursor) !== 0x00) {
					cursor += 1;
				}
				const seq2 = new Uint8Array(data, seq2Start, cursor - seq2Start);
				cursor += 1; // Skip terminator_2

				// Check if last byte of seq_2 equals tag
				if (seq2.length > 0 && seq2[seq2.length - 1] === this.tag) {
					// Parse seq_3
					const seq3Start = cursor;
					while (cursor < data.byteLength && view.getUint8(cursor) !== 0x00) {
						cursor += 1;
					}
					const seq3 = new Uint8Array(data, seq3Start, cursor - seq3Start);
					cursor += 1; // Skip terminator_3
				}
			}
		} else {
			// Unknown type - treat as raw bytes
			this.payload = new Uint8Array(data, cursor, 6); // Default to 6 bytes
			cursor += 6;
		}

		this.endOfPayload = cursor;

		// Parse key FString (now at the end)
		this.key = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		// Parse padding (now at the end)
		this.padding = new Uint8Array(data, cursor, 4);
		cursor += 4;

		this.endOffset = cursor;
		this.bytes = new Uint8Array(data, offset, this.endOffset - this.startOffset);
	}

	getSize(): number {
		return this.endOffset - this.startOffset;
	}

	toString(): string {
		return `Property(tag=0x${this.tag.toString(16)}, type=0x${this.type.toString(16)}, key="${this.key}")`;
	}
}

/**
 * GameInfo class - represents game information in the replay
 */
export class GameInfo {
	public size: number;
	public someBigNumber: number;
	public someConst: number;
	public padding: Uint8Array;
	public someConst2: number;
	public padding2: Uint8Array;
	public unknownSequence: Uint8Array;
	public index0: number;
	public engineVersion: string;
	public index1: number;
	public mapPath: string;
	public padding3: Uint8Array;
	public bytes: Uint8Array;
	private startOffset: number;
	private endOffset: number;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.startOffset = offset;
		let cursor = offset;

		// Parse fixed fields
		this.size = view.getUint32(cursor, true);
		cursor += 4;

		this.someBigNumber = view.getUint32(cursor, true);
		cursor += 4;

		this.someConst = view.getUint32(cursor, true);
		cursor += 4;

		this.padding = new Uint8Array(data, cursor, 4);
		cursor += 4;

		this.someConst2 = view.getUint32(cursor, true);
		cursor += 4;

		this.padding2 = new Uint8Array(data, cursor, 4);
		cursor += 4;

		this.unknownSequence = new Uint8Array(data, cursor, 22);
		cursor += 22;

		this.index0 = view.getUint32(cursor, true);
		cursor += 4;

		// Parse engine_version FString
		this.engineVersion = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		// Parse index_1
		this.index1 = view.getUint32(cursor, true);
		cursor += 4;

		// Parse map_path FString
		this.mapPath = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		// Parse final padding
		this.padding3 = new Uint8Array(data, cursor, 12);
		cursor += 12;

		this.endOffset = cursor;
		this.bytes = new Uint8Array(data, offset, this.endOffset - this.startOffset);
	}

	getSize(): number {
		return this.endOffset - this.startOffset;
	}

	toString(): string {
		return `GameInfo(engineVersion="${this.engineVersion}", mapPath="${this.mapPath}")`;
	}
}

/**
 * GameEvent class - represents a game event in the replay
 */
export class GameEvent {
	public size: number;
	public demoId: string;
	public eventName: string;
	public playerName?: string;
	public padding?: Uint8Array;
	public someNumber: number;
	public someNumber2: number;
	public padding2: Uint8Array;
	public bytes: Uint8Array;
	private startOffset: number;
	private endOffset: number;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.startOffset = offset;
		let cursor = offset;

		// Parse size
		this.size = view.getUint32(cursor, true);
		cursor += 4;

		// Parse demo_id FString
		this.demoId = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		// Parse event_name FString
		this.eventName = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		// Conditional parsing based on event_name
		if (this.eventName === 'PlayerRespawn') {
			this.playerName = parseFString(data, cursor);
			cursor += sizeofFString(data, cursor);
		} else {
			this.padding = new Uint8Array(data, cursor, 4);
			cursor += 4;
		}

		// Parse remaining fields
		this.someNumber = view.getUint32(cursor, true);
		cursor += 4;

		this.someNumber2 = view.getUint32(cursor, true);
		cursor += 4;

		this.padding2 = new Uint8Array(data, cursor, 4);
		cursor += 4;

		this.endOffset = cursor;
		this.bytes = new Uint8Array(data, offset, this.endOffset - this.startOffset);
	}

	getSize(): number {
		return this.endOffset - this.startOffset;
	}

	toString(): string {
		return `${this.eventName}()`;
	}
}

/**
 * GameSomething1 class - represents game state information
 */
export class GameSomething1 {
	public int1: number;
	public zero1: number;
	public int2: number;
	public int3: number;
	public int3Repeated: number;
	public zero2: number;
	public seq1: Uint8Array;
	public gameState: string;
	public seq2: Uint8Array;
	public properties: Property[];
	public bytes: Uint8Array;
	private startOffset: number;
	private endOffset: number;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.startOffset = offset;
		let cursor = offset;

		// Parse fixed fields
		this.int1 = view.getUint32(cursor, true);
		cursor += 4;

		this.zero1 = view.getUint32(cursor, true);
		cursor += 4;

		this.int2 = view.getUint32(cursor, true);
		cursor += 4;

		this.int3 = view.getUint32(cursor, true);
		cursor += 4;

		this.int3Repeated = view.getUint32(cursor, true);
		cursor += 4;

		this.zero2 = view.getUint32(cursor, true);
		cursor += 4;

		this.seq1 = new Uint8Array(data, cursor, 7);
		cursor += 7;

		// Parse game_state FString
		this.gameState = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		this.seq2 = new Uint8Array(data, cursor, 10);
		cursor += 10;

		// Parse properties array
		this.properties = [];
		while (cursor < data.byteLength) {
			try {
				const prop = new Property(data, cursor);
				this.properties.push(prop);
				cursor += prop.getSize();
			} catch (error) {
				// End of properties
				break;
			}
		}

		this.endOffset = cursor;
		this.bytes = new Uint8Array(data, offset, this.endOffset - this.startOffset);
	}

	getSize(): number {
		return this.endOffset - this.startOffset;
	}

	toString(): string {
		return `GameSomething1(int1=${this.int1}, gameState='${this.gameState}')`;
	}
}

/**
 * CommentBlock class - represents a comment block in the replay
 */
export class CommentBlock {
	public padding: Uint8Array;
	public comment: string;
	public padding2: Uint8Array;
	public timestamp: Date;
	public padding3: Uint8Array;
	public bytes: Uint8Array;
	private startOffset: number;
	private endOffset: number;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.startOffset = offset;
		let cursor = offset;

		// Parse padding
		this.padding = new Uint8Array(data, cursor, 4);
		cursor += 4;

		// Parse comment FString
		this.comment = parseFString(data, cursor);
		cursor += sizeofFString(data, cursor);

		// Parse padding2
		this.padding2 = new Uint8Array(data, cursor, 4);
		cursor += 4;

		// Parse timestamp
		this.timestamp = parseFDateTime(data, cursor);
		cursor += 8;

		// Parse padding3
		this.padding3 = new Uint8Array(data, cursor, 12);
		cursor += 12;

		this.endOffset = cursor;
		this.bytes = new Uint8Array(data, offset, this.endOffset - this.startOffset);
	}

	getSize(): number {
		return this.endOffset - this.startOffset;
	}

	toString(): string {
		return `CommentBlock(comment="${this.comment}", timestamp=${this.timestamp.toISOString()})`;
	}
}

/**
 * InfoBlock class - represents an info block in the replay
 */
export class InfoBlock {
	public type: number;
	public content: GameInfo | GameSomething1 | CommentBlock | GameEvent | null;
	public bytes: Uint8Array;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);
		this.type = view.getUint32(offset, true);

		switch (this.type) {
			case InfoBlockType.GameInfo:
				this.content = new GameInfo(data, offset + 4);
				break;
			case InfoBlockType.GameSomething1:
				this.content = new GameSomething1(data, offset + 4);
				break;
			case InfoBlockType.CommentBlock:
				this.content = new CommentBlock(data, offset + 4);
				break;
			case InfoBlockType.GameEvent:
				this.content = new GameEvent(data, offset + 4);
				break;
			default:
				this.content = null;
		}

		// Store the bytes for this InfoBlock
		if (this.content) {
			this.bytes = new Uint8Array(data, offset, 4 + this.content.getSize());
		} else {
			this.bytes = new Uint8Array(data, offset, 4);
		}
	}

	getSize(): number {
		if (this.content) {
			return 4 + this.content.getSize(); // 4 bytes for type + content size
		} else {
			return 4; // Just the type field
		}
	}

	toString(): string {
		if (this.content) {
			return `0x${this.type.toString(16)}: ${this.content}`;
		} else {
			return `0x${this.type.toString(16)}: Unknown`;
		}
	}
}

/**
 * Metadata class - represents the metadata section of the replay
 */
export class Metadata {
	public signature: Uint8Array;
	public version: number;
	public tickCount: number;
	public infoBlock0: InfoBlock;
	public infoBlock1: InfoBlock;
	public infoBlock2: InfoBlock;
	public infoBlock3: InfoBlock;
	public infoBlock4: InfoBlock;
	public padding: Uint8Array;
	public bytes: Uint8Array;

	constructor(data: ArrayBuffer, offset: number = 0) {
		const view = new DataView(data);

		this.signature = new Uint8Array(data, offset, 4);
		this.version = view.getUint32(offset + 4, true);
		this.tickCount = view.getUint32(offset + 8, true);

		// Parse info blocks with proper offset calculation
		let currentOffset = offset + 12;

		// Parse each info block and calculate next offset
		this.infoBlock0 = new InfoBlock(data, currentOffset);
		currentOffset += this.infoBlock0.getSize();

		this.infoBlock1 = new InfoBlock(data, currentOffset);
		currentOffset += this.infoBlock1.getSize();

		this.infoBlock2 = new InfoBlock(data, currentOffset);
		currentOffset += this.infoBlock2.getSize();

		this.infoBlock3 = new InfoBlock(data, currentOffset);
		currentOffset += this.infoBlock3.getSize();

		this.infoBlock4 = new InfoBlock(data, currentOffset);
		currentOffset += this.infoBlock4.getSize();

		// Find padding position
		this.padding = new Uint8Array(data, currentOffset, 4);

		// Store the complete bytes for this Metadata
		this.bytes = new Uint8Array(data, offset, currentOffset + 4 - offset);
	}

	toString(): string {
		return `Metadata(version=${this.version}, tickCount=${this.tickCount})`;
	}

	get gameInfo(): GameInfo | null {
		// Check all info blocks for GameInfo type
		const blocks = [
			this.infoBlock0,
			this.infoBlock1,
			this.infoBlock2,
			this.infoBlock3,
			this.infoBlock4
		];
		for (const block of blocks) {
			if (block.type === InfoBlockType.GameInfo && block.content instanceof GameInfo) {
				return block.content;
			}
		}
		return null;
	}
}

/**
 * Parse replay metadata from binary data
 */
export function parseReplayMetadata(data: ArrayBuffer, offset: number = 0): Metadata {
	return new Metadata(data, offset);
}

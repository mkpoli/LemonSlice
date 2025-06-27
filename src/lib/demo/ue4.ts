/**
 * UE4 utilities for parsing replay files
 * Based on the Python implementation in ue4.py
 */

/**
 * Parse an FString from the given data starting at offset.
 * FString is a variable-length string with a length prefix.
 */
export function parseFString(data: ArrayBuffer, offset: number): string {
	try {
		const view = new DataView(data);

		// Check if we have enough data for the length field
		if (offset + 4 > data.byteLength) {
			return '';
		}

		// Read the length field (s32 = signed 32-bit integer)
		const length = view.getInt32(offset, true);
		let cursor = offset + 4; // Move past the length field

		// Validate length to prevent invalid array creation
		if (length > 0) {
			// Check if we have enough data for the string
			if (cursor + length > data.byteLength) {
				return '';
			}

			// ANSI/UTF-8 encoding
			// Read length-1 bytes for the data, plus 1 byte for sentinel
			const nameBytes = new Uint8Array(data, cursor, length - 1);
			const sentinel = view.getUint8(cursor + length - 1);
			return new TextDecoder('utf-8', { fatal: false }).decode(nameBytes);
		} else if (length < 0) {
			// Check if length is reasonable (prevent huge negative values)
			if (length < -1000000) {
				return '';
			}

			// UTF-16 encoding
			// Read (-length-1) * 2 bytes for the data, plus 2 bytes for sentinel
			const nameLength = (-length - 1) * 2;

			// Check if we have enough data for the string
			if (cursor + nameLength + 2 > data.byteLength) {
				return '';
			}

			const nameBytes = new Uint8Array(data, cursor, nameLength);
			const sentinel = new Uint8Array(data, cursor + nameLength, 2);
			return new TextDecoder('utf-16le', { fatal: false }).decode(nameBytes);
		} else {
			// length == 0, empty string
			return '';
		}
	} catch (error) {
		console.warn('Error parsing FString:', error);
		return '';
	}
}

/**
 * Calculate the size of an FString without parsing it.
 */
export function sizeofFString(data: ArrayBuffer, offset: number): number {
	try {
		const view = new DataView(data);

		// Check if we have enough data for the length field
		if (offset + 4 > data.byteLength) {
			return 4; // Just return the length field size
		}

		// Read the length field (s32 = signed 32-bit integer)
		const length = view.getInt32(offset, true);

		// Validate length to prevent unreasonable calculations
		if (length > 0) {
			// Check if the calculated size would exceed the buffer
			const totalSize = 4 + length;
			if (offset + totalSize > data.byteLength) {
				return 4; // Just return the length field size
			}
			// ANSI/UTF-8 encoding
			// 4 bytes for length + length bytes (including sentinel)
			return totalSize;
		} else if (length < 0) {
			// Check if length is reasonable (prevent huge negative values)
			if (length < -1000000) {
				return 4; // Just return the length field size
			}

			// Check if the calculated size would exceed the buffer
			const totalSize = 4 + (-length - 1) * 2 + 2;
			if (offset + totalSize > data.byteLength) {
				return 4; // Just return the length field size
			}

			// UTF-16 encoding
			// 4 bytes for length + (-length-1) * 2 bytes for data + 2 bytes for sentinel
			return totalSize;
		} else {
			// length == 0, empty string
			// Just 4 bytes for the length field
			return 4;
		}
	} catch (error) {
		console.warn('Error calculating FString size:', error);
		return 4; // Return minimum size on error
	}
}

/**
 * Parse an FDateTime from the given data starting at offset.
 * FDateTime is a u64 value representing time in 100-nanosecond intervals
 * since January 1, 1601 (UTC).
 */
export function parseFDateTime(data: ArrayBuffer, offset: number): Date {
	const view = new DataView(data);

	// Read the 64-bit unsigned integer (u64)
	const timestampTicks = view.getBigUint64(offset, true);

	// Convert to datetime
	// FDateTime uses 100-nanosecond intervals since January 1, 1601
	// Convert to seconds since Unix epoch (January 1, 1970)

	// Constants from the format function:
	// value / 10000000 - 62135596800
	// Where 62135596800 is the seconds between 1601-01-01 and 1970-01-01
	// And 10000000 converts from 100-nanosecond intervals to seconds

	if (timestampTicks > 0n) {
		// Convert from 100-nanosecond ticks to seconds since Unix epoch
		const unixSeconds = Number(timestampTicks) / 10000000 - 62135596800;
		return new Date(unixSeconds * 1000); // Convert to milliseconds
	} else {
		// Handle zero/invalid timestamp
		return new Date(0);
	}
}

/**
 * Format an FDateTime value as a human-readable string.
 */
export function formatFDateTime(timestampTicks: bigint): string {
	if (timestampTicks > 0n) {
		const unixSeconds = Number(timestampTicks) / 10000000 - 62135596800;
		const dt = new Date(unixSeconds * 1000);
		return dt.toISOString();
	} else {
		return 'Invalid DateTime';
	}
}

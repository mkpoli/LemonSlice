import { parseReplayMetadata } from './replay';

function readReplayFile(arrayBuffer: ArrayBuffer) {
	const view = new DataView(arrayBuffer);

	// Read magic number as byte array (no endianness)
	const magicBytes = new Uint8Array(arrayBuffer, 0, 4);
	const expectedMagic = new Uint8Array([0x7f, 0xe2, 0xa2, 0x1c]);

	// Compare byte arrays
	let magicMatch = true;
	for (let i = 0; i < 4; i++) {
		if (magicBytes[i] !== expectedMagic[i]) {
			magicMatch = false;
			break;
		}
	}

	if (!magicMatch) {
		const magicHex = Array.from(magicBytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		throw new Error(`Invalid replay file. Expected magic: 1ca2e27f, got: ${magicHex}`);
	}

	// Parse metadata starting at offset 0 (the metadata includes the signature)
	const metadata = parseReplayMetadata(arrayBuffer, 0);

	return {
		magic: magicBytes,
		metadata
	};
}

export { readReplayFile };

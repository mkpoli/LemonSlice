<script lang="ts">
	import { readReplayFile } from '$lib/demo/index';
	import { extractMapName } from '$lib/demo/game';
	import { InfoBlockType } from '$lib/demo/replay';

	interface Props {
		file: File;
	}

	let { file }: Props = $props();

	let replayData: any = $state(null);
	let loading = $state(false);
	let error: string | null = $state(null);

	async function parseReplay() {
		loading = true;
		error = null;

		try {
			const arrayBuffer = await file.arrayBuffer();

			// Validate file structure first
			const validation = validateReplayFileStructure(arrayBuffer);
			if (!validation.valid) {
				error = validation.error || 'File validation failed';
				return;
			}

			// Parse the replay file using the real parser
			const replay = readReplayFile(arrayBuffer);

			// Get game info
			const gameInfo = replay.metadata.gameInfo;
			const mapName = gameInfo ? extractMapName(gameInfo.mapPath) : null;

			// Process info blocks
			const blocks = [
				replay.metadata.infoBlock0,
				replay.metadata.infoBlock1,
				replay.metadata.infoBlock2,
				replay.metadata.infoBlock3,
				replay.metadata.infoBlock4
			];

			// Extract events
			const events = blocks
				.filter((block) => block.type === InfoBlockType.GameEvent)
				.map((block) => block.content)
				.filter((content) => content !== null);

			replayData = {
				success: true,
				replay,
				gameInfo,
				mapName,
				events
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to parse replay file';
		} finally {
			loading = false;
		}
	}

	// Validate replay file before parsing
	function validateReplayFileStructure(arrayBuffer: ArrayBuffer): {
		valid: boolean;
		error?: string;
	} {
		try {
			const view = new DataView(arrayBuffer);

			// Check minimum file size
			if (arrayBuffer.byteLength < 16) {
				return { valid: false, error: 'File too small to be a valid replay file' };
			}

			// Check magic number as byte array (no endianness)
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
				return { valid: false, error: `Invalid magic number: ${magicHex}` };
			}

			// Check version at offset 4
			const version = view.getUint32(4, true);
			if (version < 1 || version > 1000) {
				return { valid: false, error: `Invalid version number: ${version}` };
			}

			// Check tick count at offset 8
			const tickCount = view.getUint32(8, true);
			if (tickCount < 0 || tickCount > 1000000000) {
				return { valid: false, error: `Invalid tick count: ${tickCount}` };
			}

			return { valid: true };
		} catch (error) {
			return {
				valid: false,
				error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	// Auto-parse when file changes
	$effect(() => {
		if (file) {
			parseReplay();
		}
	});

	function formatDate(date: Date): string {
		return date.toLocaleString();
	}

	function getBlockTypeName(type: number): string {
		switch (type) {
			case InfoBlockType.GameInfo:
				return 'Game Info';
			case InfoBlockType.GameSomething1:
				return 'Game Something 1';
			case InfoBlockType.CommentBlock:
				return 'Comment Block';
			case InfoBlockType.GameEvent:
				return 'Game Event';
			default:
				return `Unknown (${type})`;
		}
	}
</script>

<div class="replay-details">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Parsing replay file...</p>
		</div>
	{:else if error}
		<div class="error">
			<h3>Error Parsing Replay</h3>
			<p>{error}</p>
		</div>
	{:else if replayData}
		<div class="replay-content">
			<div class="header">
				<h3>Replay Details</h3>
				<span class="file-name">{file.name}</span>
			</div>

			<div class="sections">
				<!-- Basic Info -->
				<section class="info-section">
					<h4>Basic Information</h4>
					<div class="info-grid">
						<div class="info-item">
							<label for="magic-number">Magic Number:</label>
							<input
								id="magic-number"
								type="text"
								value={Array.from(replayData.replay.magic as Uint8Array)
									.map((b: number) => b.toString(16).padStart(2, '0'))
									.join('')}
								readonly
							/>
						</div>
						<div class="info-item">
							<label for="version">Version:</label>
							<input id="version" type="text" value={replayData.replay.metadata.version} readonly />
						</div>
						<div class="info-item">
							<label for="tick-count">Tick Count:</label>
							<input
								id="tick-count"
								type="text"
								value={replayData.replay.metadata.tickCount.toLocaleString()}
								readonly
							/>
						</div>
					</div>
				</section>

				<!-- Game Info -->
				{#if replayData.gameInfo}
					<section class="info-section">
						<h4>Game Information</h4>
						<div class="info-grid">
							<div class="info-item">
								<label for="engine-version">Engine Version:</label>
								<input
									id="engine-version"
									type="text"
									value={replayData.gameInfo.engineVersion}
									readonly
								/>
							</div>
							<div class="info-item">
								<label for="map-name">Map Name:</label>
								<input
									id="map-name"
									type="text"
									value={replayData.mapName || 'Unknown'}
									readonly
									class="map-name"
								/>
							</div>
							<div class="info-item">
								<label for="map-path">Map Path:</label>
								<input
									id="map-path"
									type="text"
									value={replayData.gameInfo.mapPath}
									readonly
									class="map-path"
								/>
							</div>
						</div>
					</section>
				{/if}

				<!-- Info Blocks -->
				<section class="info-section">
					<h4>Info Blocks</h4>
					<div class="blocks-grid">
						{#each [replayData.replay.metadata.infoBlock0, replayData.replay.metadata.infoBlock1, replayData.replay.metadata.infoBlock2, replayData.replay.metadata.infoBlock3, replayData.replay.metadata.infoBlock4] as block, index}
							<div class="block-item">
								<div class="block-header">
									<span class="block-index">Block {index}</span>
									<span class="block-type">{getBlockTypeName(block.type)}</span>
								</div>
								{#if block.content}
									<div class="block-content">
										{#if block.type === InfoBlockType.GameEvent}
											<div class="event-details">
												<div><strong>Event:</strong> {block.content.eventName}</div>
												<div><strong>Demo ID:</strong> {block.content.demoId}</div>
												{#if block.content.playerName}
													<div><strong>Player:</strong> {block.content.playerName}</div>
												{/if}
											</div>
										{:else if block.type === InfoBlockType.CommentBlock}
											<div class="comment-details">
												<div><strong>Comment:</strong> {block.content.comment}</div>
												<div><strong>Timestamp:</strong> {formatDate(block.content.timestamp)}</div>
											</div>
										{:else}
											<div class="generic-content">
												<pre>{JSON.stringify(block.content, null, 2)}</pre>
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>

				<!-- Events Summary -->
				{#if replayData.events && replayData.events.length > 0}
					<section class="info-section">
						<h4>Game Events ({replayData.events.length})</h4>
						<div class="events-list">
							{#each replayData.events as event}
								<div class="event-item">
									<span class="event-name">{event.eventName}</span>
									<span class="event-demo-id">{event.demoId}</span>
									{#if event.playerName}
										<span class="event-player">{event.playerName}</span>
									{/if}
								</div>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.replay-details {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-top: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 2px solid #fde68a;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: #a16207;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #fef9e7;
		border-top: 4px solid #fbbf24;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error {
		background: #fef3c7;
		border: 1px solid #fbbf24;
		border-radius: 8px;
		padding: 1rem;
		color: #92400e;
	}

	.replay-content {
		width: 100%;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #fde68a;
	}

	.header h3 {
		margin: 0;
		color: #78350f;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.file-name {
		color: #a16207;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-section {
		border: 1px solid #fde68a;
		border-radius: 8px;
		padding: 1rem;
		background: #fef9e7;
	}

	.info-section h4 {
		margin: 0 0 1rem 0;
		color: #78350f;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-item label {
		font-size: 0.875rem;
		color: #a16207;
		font-weight: 500;
	}

	.info-item input {
		font-size: 0.875rem;
		color: #78350f;
		font-weight: 500;
		border: 1px solid #fde68a;
		border-radius: 4px;
		padding: 0.5rem 0.75rem;
		background-color: #fef9e7;
		width: 100%;
		box-sizing: border-box;
	}

	.info-item input:focus {
		outline: none;
		border-color: #fbbf24;
		box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
	}

	.info-item input[readonly] {
		cursor: default;
		background-color: #fef9e7;
	}

	.info-item input[readonly]:focus {
		border-color: #fde68a;
		box-shadow: none;
	}

	.map-name {
		color: #059669 !important;
		font-weight: 600 !important;
	}

	.map-path {
		font-family: monospace;
		font-size: 0.875rem;
		color: #a16207;
	}

	.blocks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.block-item {
		border: 1px solid #fde68a;
		border-radius: 6px;
		padding: 0.75rem;
		background: #fef9e7;
	}

	.block-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.block-index {
		font-weight: 600;
		color: #78350f;
		font-size: 0.875rem;
	}

	.block-type {
		background: #fbbf24;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.block-content {
		font-size: 0.875rem;
		color: #78350f;
	}

	.event-details,
	.comment-details {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.generic-content pre {
		font-size: 0.75rem;
		background: #fef3c7;
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
		margin: 0;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem;
		background: #fef9e7;
		border-radius: 4px;
		font-size: 0.875rem;
		border: 1px solid #fde68a;
	}

	.event-name {
		font-weight: 600;
		color: #059669;
	}

	.event-demo-id {
		color: #a16207;
		font-family: monospace;
	}

	.event-player {
		color: #fbbf24;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.blocks-grid {
			grid-template-columns: 1fr;
		}

		.event-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>

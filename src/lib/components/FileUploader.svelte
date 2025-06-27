<script lang="ts">
	interface Props {
		accept?: string;
		multiple?: boolean;
		maxSize?: number; // 10MB default
		disabled?: boolean;
		onFiles: (files: FileList) => void;
		onError: (error: string) => void;
	}

	let {
		accept = '*',
		multiple = false,
		maxSize = 10 * 1024 * 1024,
		disabled = false,
		onFiles,
		onError
	}: Props = $props();

	let dragOver = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (!disabled) {
			dragOver = true;
		}
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		if (disabled) return;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFiles(files);
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			handleFiles(target.files);
		}
	}

	function handleFiles(files: FileList) {
		// Validate file size only if maxSize is not unlimited
		if (maxSize !== Number.MAX_SAFE_INTEGER) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.size > maxSize) {
					onError(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}`);
					return;
				}
			}
		}

		onFiles(files);
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function triggerFileInput() {
		if (!disabled) {
			fileInput?.click();
		}
	}
</script>

<div
	class="file-uploader"
	class:drag-over={dragOver}
	class:disabled
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={triggerFileInput}
	role="button"
	tabindex={disabled ? -1 : 0}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			triggerFileInput();
		}
	}}
>
	<div class="upload-content">
		<div class="upload-icon">
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7,10 12,15 17,10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
		</div>
		<div class="upload-text">
			<p class="primary-text">
				{#if dragOver}
					Drop replay files here
				{:else}
					Click to upload or drag and drop replay files
				{/if}
			</p>
			<p class="secondary-text">
				{accept === '*'
					? 'Any file type'
					: accept === '.replay'
						? 'Strinova/CalabiYau replay files (.replay)'
						: accept}
				{#if maxSize !== Number.MAX_SAFE_INTEGER}
					• Max {formatFileSize(maxSize)}
				{/if}
				{#if multiple}
					• Multiple files allowed
				{/if}
			</p>
		</div>
	</div>

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		onchange={handleFileSelect}
		style="display: none;"
		{disabled}
	/>
</div>

<style>
	.file-uploader {
		position: relative;
		width: 100%;
		min-height: 200px;
		border: 2px dashed #fde68a;
		border-radius: 12px;
		background-color: #fef9e7;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		box-sizing: border-box;
	}

	.file-uploader:hover:not(.disabled) {
		border-color: #fbbf24;
		background-color: #fef3c7;
		transform: scale(1.02);
	}

	.file-uploader.drag-over {
		border-color: #fbbf24;
		background-color: #fef9e7;
		transform: scale(1.02);
	}

	.file-uploader.disabled {
		opacity: 0.6;
		cursor: not-allowed;
		border-color: #fde68a;
		background-color: #fef9e7;
	}

	.upload-content {
		text-align: center;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.upload-icon {
		margin-bottom: 1rem;
		color: #a16207;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.file-uploader:hover:not(.disabled) .upload-icon,
	.file-uploader.drag-over .upload-icon {
		color: #78350f;
	}

	.upload-text {
		pointer-events: none;
	}

	.primary-text {
		font-size: 1.125rem;
		font-weight: 600;
		color: #78350f;
		margin: 0 0 0.5rem 0;
	}

	.secondary-text {
		font-size: 0.875rem;
		color: #a16207;
		margin: 0;
	}

	.file-uploader:hover:not(.disabled) .primary-text {
		color: #92400e;
	}

	.file-uploader:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
	}

	/* Animation for drag over state */
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	.file-uploader.drag-over {
		animation: pulse 0.6s ease-in-out;
	}
</style>

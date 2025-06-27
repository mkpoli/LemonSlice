<script lang="ts">
	import FileUploader from '$lib/components/FileUploader.svelte';
	import ReplayDetails from '$lib/components/ReplayDetails.svelte';

	let uploadedFiles: File[] = [];
	let errorMsg = '';
</script>

<div class="container">
	<header class="header">
		<h1 class="title">LemonSlice</h1>
		<p class="subtitle">Personal stats tracker and replay analyzer for Strinova</p>
	</header>

	<main class="main">
		<section class="upload-section">
			<h2 class="section-title">Upload Replay Files</h2>
			<FileUploader
				accept=".replay"
				multiple={true}
				maxSize={Number.MAX_SAFE_INTEGER}
				onFiles={(files) => {
					uploadedFiles = Array.from(files);
					errorMsg = '';
				}}
				onError={(error) => {
					errorMsg = error;
				}}
			/>
		</section>

		{#if errorMsg}
			<div class="error-message">
				<p>{errorMsg}</p>
			</div>
		{/if}

		{#if uploadedFiles.length}
			<section class="files-section">
				<h2 class="section-title">Uploaded Files</h2>
				<div class="files-list">
					{#each uploadedFiles as file}
						<div class="file-item">
							<span class="file-name">{file.name}</span>
							<span class="file-size">({Math.round(file.size / 1024)} KB)</span>
						</div>
					{/each}
				</div>
			</section>

			<!-- Replay Details for each file -->
			{#each uploadedFiles as file}
				<ReplayDetails {file} />
			{/each}
		{/if}
	</main>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		color: #78350f;
	}

	.title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.subtitle {
		font-size: 1.125rem;
		margin: 0;
		opacity: 0.8;
		font-weight: 300;
	}

	.main {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		border: 2px solid #fde68a;
	}

	.upload-section {
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #78350f;
		margin: 0 0 1rem 0;
	}

	.error-message {
		background: #fef3c7;
		border: 1px solid #fbbf24;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.error-message p {
		color: #92400e;
		margin: 0;
		font-weight: 500;
	}

	.files-section {
		border-top: 1px solid #fde68a;
		padding-top: 1.5rem;
	}

	.files-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.file-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #fef3c7;
		border: 1px solid #fde68a;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		transition: all 0.2s ease;
	}

	.file-item:hover {
		background: #fef9e7;
		border-color: #fbbf24;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(251, 191, 36, 0.15);
	}

	.file-name {
		font-weight: 500;
		color: #78350f;
		flex: 1;
	}

	.file-size {
		color: #a16207;
		font-size: 0.875rem;
		font-weight: 400;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.title {
			font-size: 2.5rem;
		}

		.main {
			padding: 1.5rem;
		}

		.file-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>

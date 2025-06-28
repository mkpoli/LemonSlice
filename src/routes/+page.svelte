<script lang="ts">
	import FileUploader from '$lib/components/FileUploader.svelte';
	import ReplayDetails from '$lib/components/ReplayDetails.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import type { PageProps } from './$types';

	let uploadedFiles: File[] = $state([]);
	let errorMsg = $state('');

	let { data }: PageProps = $props();
</script>

<div class="container">
	<header class="header">
		<div class="header-content">
			<div class="logo">
				<img src="/favicon-96x96.png" alt="LemonSlice Logo" />
			</div>
			<div class="title-section">
				<h1 class="title">LemonSlice</h1>
				<p class="subtitle">Personal stats tracker and replay analyzer for Strinova</p>
			</div>
			{#if !data.user}
				<a href={data.authURL} class="login-button">Login with LemonTV</a>
			{:else}
				<p class="flex items-center gap-2">
					Logged in as
					<UserAvatar email={data.user.email} />
					{data.user.username}
				</p>
			{/if}
		</div>
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

	<footer class="footer">
		<div class="footer-content">
			<div class="footer-links">
				<a
					href="https://lemontv.win/"
					target="_blank"
					rel="noopener noreferrer"
					class="footer-link"
				>
					LemonTV
				</a>
				<a
					href="https://lemonade.strinova.win/"
					target="_blank"
					rel="noopener noreferrer"
					class="footer-link"
				>
					Lemonade
				</a>
				<a
					href="https://github.com/mkpoli/LemonSlice"
					target="_blank"
					rel="noopener noreferrer"
					class="footer-link"
				>
					GitHub
				</a>
				<a
					href="https://discord.gg/mY8DMatXM4"
					target="_blank"
					rel="noopener noreferrer"
					class="footer-link"
				>
					Discord
				</a>
			</div>
			<div class="footer-text">
				<p>&copy; 2025 LemonTV. Made with ❤️ for the Strinova community.</p>
			</div>
		</div>
	</footer>
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

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.logo {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
	}

	.logo img {
		width: 80px;
		height: 80px;
		border-radius: 8px;
	}

	.title-section {
		flex: 1;
		text-align: left;
	}

	.title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.subtitle {
		font-size: 1rem;
		margin: 0;
		opacity: 0.8;
		font-weight: 300;
	}

	.login-button {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: #78350f;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
	}

	.login-button:hover {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.login-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

		.header-content {
			flex-direction: column;
			text-align: center;
			gap: 1.5rem;
		}

		.logo {
			text-align: center;
		}

		.title-section {
			text-align: center;
		}

		.title {
			font-size: 2.5rem;
		}

		.login-button {
			width: 100%;
			max-width: 200px;
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

	.footer {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 2px solid #fde68a;
		text-align: center;
		color: #78350f;
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.footer-links {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.footer-link {
		color: #78350f;
		text-decoration: none;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: all 0.2s ease;
		background: rgba(251, 191, 36, 0.1);
		border: 1px solid transparent;
	}

	.footer-link:hover {
		background: rgba(251, 191, 36, 0.2);
		border-color: #fbbf24;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);
	}

	.footer-text {
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.footer-text p {
		margin: 0;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
			text-align: center;
			gap: 1.5rem;
		}

		.logo {
			text-align: center;
		}

		.title-section {
			text-align: center;
		}

		.title {
			font-size: 2.5rem;
		}

		.login-button {
			width: 100%;
			max-width: 200px;
		}

		.main {
			padding: 1.5rem;
		}

		.file-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.footer-links {
			gap: 1rem;
		}

		.footer-link {
			padding: 0.75rem 1rem;
			font-size: 0.875rem;
		}
	}
</style>

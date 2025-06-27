<script lang="ts">
	import FileUploader from '$lib/components/FileUploader.svelte';

	let uploadedFiles: File[] = [];
	let errorMsg = '';
</script>

<h1>LemonSlice</h1>

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

{#if errorMsg}
	<p style="color: red;">{errorMsg}</p>
{/if}

{#if uploadedFiles.length}
	<h2>Uploaded Files:</h2>
	<ul>
		{#each uploadedFiles as file}
			<li>{file.name} ({Math.round(file.size / 1024)} KB)</li>
		{/each}
	</ul>
{/if}

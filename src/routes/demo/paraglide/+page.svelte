<script lang="ts">
	import { setLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<button onclick={() => setLocale('en')}>en</button>
	<button onclick={() => setLocale('es')}>es</button>
	<button onclick={() => setLocale('zh')}>zh</button>
	<button onclick={() => setLocale('ko')}>ko</button>
	<button onclick={() => setLocale('ja')}>ja</button>
	<button onclick={() => setLocale('pt-br')}>pt-br</button>
	<button onclick={() => setLocale('de')}>de</button>
	<button onclick={() => setLocale('ru')}>ru</button>
	<button onclick={() => setLocale('zh-tw')}>zh-tw</button>
	<button onclick={() => setLocale('vi')}>vi</button>
	<button onclick={() => setLocale('id')}>id</button>
	<button onclick={() => setLocale('fr')}>fr</button>
	<button onclick={() => setLocale('uk-ua')}>uk-ua</button>
</div>
<p>
	If you use VSCode, install the <a
		href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
		target="_blank">Sherlock i18n extension</a
	> for a better i18n experience.
</p>

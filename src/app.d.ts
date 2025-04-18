// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

namespace svelteHTML {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	/* eslint-disable @typescript-eslint/no-explicit-any */
	interface HTMLAttributes<T> {
		[key: string]: any;
	}
	/* eslint-enable @typescript-eslint/no-explicit-any */
	/* eslint-enable @typescript-eslint/no-unused-vars */
}

// Add these module declarations
declare module '$app/navigation' {
	export function goto(url: string, opts?: { replaceState?: boolean }): Promise<void>;
	export function invalidate(url: string): Promise<void>;
	export function beforeNavigate(
		callback: (navigation: { from: URL; to: URL | null; cancel: () => void }) => void
	): () => void;
	export function afterNavigate(
		callback: (navigation: { from: URL | null; to: URL }) => void
	): () => void;
}

declare module 'svelte-sonner';

export {};

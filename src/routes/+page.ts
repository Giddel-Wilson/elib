import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { AuthData } from '$lib/types/auth';

export const load = (async ({ parent, url }) => {
	try {
		// Check if we can access parent data
		const parentData = await parent();
		const data = parentData as { auth?: AuthData };

		// Only redirect if we have auth data and user is not authenticated
		if (data?.auth && !data.auth.isAuthenticated && url.pathname !== '/auth') {
			throw redirect(307, '/auth');
		}

		return {
			auth: data?.auth || { isAuthenticated: false }
		};
	} catch (error) {
		// If the error is a redirect, let it happen
		if (error?.status === 307) {
			throw error;
		}

		console.error('Error in page load:', error);
		return {
			auth: { isAuthenticated: false }
		};
	}
}) satisfies PageLoad;

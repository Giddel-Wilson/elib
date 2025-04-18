import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Log incoming requests (useful for debugging)
	console.log(`[${event.request.method}] ${event.url.pathname}`);

	try {
		// Add custom headers for security and caching
		const response = await resolve(event, {
			transformPageChunk: ({ html }) => html
		});

		// Add security headers
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Permissions-Policy', 'interest-cohort=()');

		return response;
	} catch (error) {
		console.error('Server error:', error);

		// If it's already a redirect or response, let it happen
		if (error instanceof Response || error?.status === 307) {
			return error;
		}

		// If the error happens on the home page, don't redirect to avoid loops
		if (event.url.pathname !== '/error') {
			throw redirect(307, '/error');
		}

		// Otherwise return a generic error response
		return new Response('Server Error', {
			status: 500,
			headers: {
				'Content-Type': 'text/html'
			}
		});
	}
};

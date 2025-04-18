import type { LayoutServerLoad } from './$types';

// Make auth detection more resilient
export const load: LayoutServerLoad = async ({ cookies }) => {
	try {
		// Get auth token from cookies
		const token = cookies.get('auth_token');
		const user = cookies.get('user');

		let userData = null;
		if (user) {
			try {
				userData = JSON.parse(user);
			} catch (e) {
				console.error('Failed to parse user data from cookie:', e);
			}
		}

		return {
			auth: {
				isAuthenticated: !!token,
				token: token || null,
				user: userData
			}
		};
	} catch (e) {
		console.error('Error in layout server load:', e);

		// Return safe default values
		return {
			auth: {
				isAuthenticated: false,
				token: null,
				user: null
			}
		};
	}
};

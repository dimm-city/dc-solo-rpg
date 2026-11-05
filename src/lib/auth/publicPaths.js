const PUBLIC_PATHS = ['/signin', '/auth', '/about', '/how-to', '/_app'];

/**
 * Whether a pathname can be visited without signing in.
 * Matches each public path exactly or as a parent of a sub-path.
 * @param {string} pathname
 * @returns {boolean}
 */
export function isPublicPath(pathname) {
	return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

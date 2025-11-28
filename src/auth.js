import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Google({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		})
	],
	secret: env.AUTH_SECRET,
	trustHost: true,
	callbacks: {
		async session({ session, token }) {
			if (session?.user) {
				session.user.id = token.sub;
			}
			return session;
		}
	},
	pages: {
		signIn: '/signin'
	}
});

import SpotifyProvider from "next-auth/providers/spotify";

const scope =
  "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-recently-played user-read-playback-state user-top-read user-modify-playback-state user-read-currently-playing user-follow-read playlist-read-private user-read-email user-read-private user-library-read playlist-read-collaborative";


const authOptions = {
    providers: [
      SpotifyProvider({
        clientId: process.env.SPOTIFY_CLIENT_ID!,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
        authorization: {
          params: { scope },
        },
        ...{ protection: "pkce" },
      }),
    ],
    callbacks: {
      async jwt({ token, account }: { token: any; account: any }) {
        if (account) {
          token.id = account.id;
          token.expires_at = account.expires_at;
          token.accessToken = account.access_token;
        }
        return token;
      },
      async session({ session, token }: { session: any; token: any }) {
        session.user = token;
        return session;
      },
    },
  };

  export default authOptions;
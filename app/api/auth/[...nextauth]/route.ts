import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify";
//https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
//https://next-auth.js.org/getting-started/example
export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        //https://next-auth.js.org/providers/spotify
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!
      }),
      // ...add more providers here
    ],
}  


const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
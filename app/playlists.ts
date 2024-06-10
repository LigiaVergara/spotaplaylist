import { getSession } from "next-auth/react";

export async function getPlaylist(user: any): Promise<any> {
  try {
    const session = await getSession(user);

    const playlists = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${(session?.user as any).accessToken}`,
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Error fetching playlists: ${res.statusText}`);
      }
      return res.json();
    });

    return playlists.items;
  } catch (error) {
    console.error('Failed to get playlists:', error);
    throw error;
  }
}

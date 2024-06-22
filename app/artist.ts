import { getSession } from "next-auth/react";

export async function getArtistID(
  user: any,
  artistName: string
): Promise<string | null> {
  try {
    const session = await getSession(user);

    const trimmedArtistName = artistName.trim();

    // Search Spotify for artist by name
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      trimmedArtistName
    )}&type=artist`;
    const data: any = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${(session?.user as any).accessToken}`,
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Error fetching artist ${artistName}: ${res.statusText}`
        );
      }
      return res.json();
    });

    if (data && data.artists && data.artists.items.length > 0) {
      // If artist found, add their Spotify ID to artistIds
      return data.artists.items[0].id;
    }

    return null;
  } catch (error) {
    console.error("Failed to get artist:", error);
    throw error;
  }
}
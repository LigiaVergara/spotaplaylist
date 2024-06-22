import { getSession } from "next-auth/react";

export async function getTracks(user: any, artistID: string): Promise<any> {
  try {
    // Retrieve the session information using Next.js' getSession
    const session = await getSession(user);

    // Construct the URL for fetching top tracks of the artist
    const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=DE&limit=3`;

    // Fetch the top tracks from Spotify API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${(session?.user as any).accessToken}`,
      },
    });

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(`Error fetching Top Tracks: ${response.statusText}`);
    }

    // Parse the response body as JSON
    const tracks = await response.json();

    // Return the array of top tracks
    return tracks.items;
  } catch (error) {
    console.error('Failed to get Top Tracks:', error);
    throw error;
  }
}

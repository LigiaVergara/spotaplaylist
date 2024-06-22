import { getSession } from "next-auth/react";

export async function postTracks(
  user: any,
  uris: string[],  // Array of track URIs to be added
  playlistId: string
): Promise<any> {
  try {
    // Retrieve the session information using Next.js' getSession
    const session = await getSession(user);

    if (!session) {
      throw new Error("No active session found. Please log in.");
    }

    const accessToken = (session.user as any).accessToken;

    // Construct the URL for adding tracks to the playlist
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    // Prepare the body of the request
    const body = JSON.stringify({
      uris: uris,
      position: 0  // Optionally specify the position where to add the tracks
    });

    // Make the POST request to add tracks to the playlist
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`Error adding tracks to playlist: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Failed to add tracks to playlist:', error);
    throw error;
  }
}

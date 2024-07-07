import { getSession } from "next-auth/react";

export async function postTracks(
  user: any,
  uris: string[],  
  playlistId: string
): Promise<any> {
  try {
    const session = await getSession(user);

    if (!session) {
      throw new Error("No active session found. Please log in.");
    }

    const accessToken = (session.user as any).accessToken;

    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    const body = JSON.stringify({
      uris: uris,
      position: 0  
    });

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

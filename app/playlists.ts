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
export async function createPlaylist(user: any, name: string): Promise<any> {
  try {
    const session = await getSession(user);

    const userId = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${(session?.user as any).accessToken}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Error UserId");
      }

      return res.json();
    })

    const uId = userId['id'];

    if (!userId)
      throw new Error("Invalid session");

    const response = await fetch(`https://api.spotify.com/v1/users/${uId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${(session?.user as any).accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        description: '',
        public: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error creating playlist: ${response.statusText}`);
    }

    const playlist = await response.json();
    return (playlist as any).id;
  } catch (error) {
    console.error('Failed to create playlist:', error);
    throw error;
  }
}

import { getSession } from "next-auth/react";

export async function getTracks(
  user: any,
  artistID: string,
  topN: number = 1
): Promise<any> {
    try {
        const session = await getSession(user);

        const url =`https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=DE&limit=3`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${(session?.user as any).accessToken}`,
              },
            }).then(async (res) => {
        if (!res.ok) {
            throw new Error(`⁠Error fetching top tracks: ${res.statusText}`);
        }
        return await res.json();
        });

        const tracks = response["tracks"].slice(0, topN);

        return tracks.map((track: any) => {
        return track["uri"];
        });
    } catch (error) {
        console.error("Failed to get Top Tracks:", error);
        throw error;
    }}
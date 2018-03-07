const clientId = 'ff3cb0d17b3c4e43b20fbe92c309b279';
const redirectUri = 'http://localhost:3000/';
let accessToken;

const Spotify = {

  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const checkUrlToken = window.location.href.match(/access_token=([^&]*])/);
    const checkUrlTimer = window.location.href.match(/expires_in=([^&]*)/);

    if (checkUrlToken && checkUrlTimer) {
      accessToken = checkUrlToken[1];
      const expiresIn = Number(checkUrlTimer[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  search(term) {
      console.log(term)
      const accessToken = Spotify.getAccessToken();
      return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
        {headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).then(response => {
        console.log(response);
        return response.json();
       }).then(jsonResponse => {
         if (!jsonResponse.tracks) {
           return [];
         }
         return jsonResponse.tracks.items.map(track => ({
           id: track.id,
           name: track.name,
           artist: track.artists[0].name,
           album: track.album.name,
           uri: track.uri
         }));
       });
     },

  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
    }).then(response => response.json()
    ).then(jsonResponse => {
    const playlistId = jsonResponse.id;
    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({uris: trackUris})
    });
  });
});
}


};

export default Spotify

const form = document.getElementById('addPlaylistForm');
const playListDom = document.getElementById('playlists');
const playlistNameDiv = document.getElementById('playlist-name');
const playlistTracks = document.getElementById('playlistTracks');
var user = localStorage.getItem('user')
const options = document.getElementById('selectPlaylist');

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    openToast('info', 'Playlist Form Submitted')
    console.log("Playlist Form submitted");
    // Get form data
    const formData = new FormData(e.target);
    formData.append('type', document.getElementById('type').value)
    formData.append('owner', localStorage.getItem('user'))
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);

   const upload = await fetch('/public/api/createPlaylist', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formDataObject),
    }).then((res) => res.json())

    console.log(upload);

    if(upload.success){
        window.dialog.close();
        openToast('success', "Playlist created successfully");
        setTimeout( () => {
            fetchPlaylist(user);
        }, 3000)
    } else {
        window.dialog.close();
        openToast('error', `${upload.error}`);
    }

});

document.addEventListener('DOMContentLoaded', async function () {
    await fetchPlaylist(user);
})

async function fetchPlaylist(user) {
    var fetchList = await fetch(`/public/api/geAllPlaylists?user=${user}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json'
      } 
    }).then((res) => res.json())
    console.log(fetchList);
    if(fetchList.playlist){
        let list = fetchList.playlist
        let songs = fetchList
        playListDom.innerHTML = ''
        options.innerHTML = ''
            list.forEach( async(item) => {
                let template = `<a href="#" onclick="handlePlaylistClick('${item.playlistName}', '${user}')" class="navigation__list__item">
                                    <div class="playlist-content">
                                        <i class="ion-ios-musical-notes"></i>
                                        <span>${item.playlistName}</span>
                                    </div>
                                    <div>
                                        <ion-icon onclick="sharePlaylist(event,'${item.playlistName}', '${item.owner}')" class="share-btn" name="${item.type === 'public' ? 'share-social' : ''}"></ion-icon>
                                        <ion-icon name="${item.type === 'private' ? 'lock-closed-outline' : 'eye'}" class="${item.type === 'private' ? 'lock-close' : 'lock-open'} type"></ion-icon>
                                        <ion-icon onclick="deletePlaylist(event,'${item.playlistName}')" class="delete-playlist-icon" name="trash"></ion-icon>
                                    </div>
                                </a>`;


    
                playListDom.innerHTML += template

                let temp = `<option value="${item.playlistName}">${item.playlistName}</option>`

                options.innerHTML += temp

            })
    }
}

function showAddToPlaylistDialog(songId) {
    document.getElementById('selectedSong').value = songId;
    window.addSongToPlaylist.showModal();
}

function handlePlaylistClick(playlistName, user) {
    
    $('.nav-tabs li').removeClass('active'); 
    $('a[href="#playlist-tab"]').parent().addClass('active'); 
    $('.tab-pane').removeClass('active');
    $('#playlist-tab').addClass('active'); 

    displayPlaylist(playlistName, user); 
}


async function displayPlaylist(playlistName, user){
   // console.log("Playlist display", user, localStorage.getItem('user'),   user === localStorage.getItem('user'))
    try {
        const fetchList = await fetch(`/public/api/getPlaylist?playlist=${playlistName}&owner=${user}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            } 
        }).then(res => res.json());

        console.log(fetchList);
        playlistNameDiv.innerText= user === localStorage.getItem('user') ? playlistName + " Playlist " : playlistName + "( Shared )"
        if (fetchList.success && fetchList.songs.length > 0) {

            playlistTracks.innerHTML = "";
            
            fetchList.songs.forEach(song => {
                playlistTracks.innerHTML += `
                  <div class="track" onclick="playSong('${song.songId}')">
                      <div class="track__art">
                          <img src="${song.imgUrl}" alt="Cover art for '${song.name}'" />
                      </div>
                      <div class="track__title" id="${song.songId}">
                          ${song.name}
                      </div>
                      <div class="track__explicit">
                          <span class="label">${song.album}</span>
                      </div>
                      <div class="track__plays">
                        <span class="label">${song.duration}</span>
                        ${user === localStorage.getItem('user') 
                            ? `<a href="#" onclick="deleteSongFromPlaylist(event, '${playlistName}', '${song.songId}')">
                                <ion-icon class="delete-icon" name="trash"></ion-icon>
                            </a>`
                            : `<span></span>`
                        }
                      </div>
                  </div>
                `;
            });
        } else {
            console.log('No playlist found or no songs in the playlist');
            playlistTracks.innerHTML = `<h1 style="text-align: center; font-weight: bold; font-size: 22px;">Playlist is empty...</h1>`
        }
    } catch (error) {
        console.error('Error fetching playlist:', error);
    }
}


document.getElementById('addSongToPlaylistForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const selectedSong = document.getElementById('selectedSong').value;
    const selectedPlaylist = document.getElementById('selectPlaylist').value;
    console.log("Adding song:", selectedSong, "to playlist:", selectedPlaylist);
    let formDataObject = {
        owner: localStorage.getItem('user'),
        playlistName: selectedPlaylist,
        song: selectedSong
    }
    const upload = await fetch('/public/api/updatePlaylist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
        }).then((res) => res.json())
    
        console.log(upload);
        if(upload.success){
            window.addSongToPlaylist.close();
            openToast('success', "Music added to playlist successfully");
        } else {
            window.addSongToPlaylist.close();
            openToast('error', `${upload.error}`);
        }
    
});

async function deleteSongFromPlaylist(event,playlist,songId){
    event.stopPropagation();
    console.log("Delete request song -> ", songId);
    var deleteSong = await fetch(`/public/api/deleteSongInPlaylist?songId=${songId}&playlist=${playlist}&owner=${user}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json'
      } 
    }).then((res) => res.json());
    console.log(deleteSong);

    if (deleteSong.success) {
        openToast('success', "Music Deleted From Playlist");
        setTimeout( () => {
            handlePlaylistClick(playlist)
        }, 3000)
    } else {
        openToast('error', `${deleteSong.error}. Please retry later!`)
    }
}

async function deletePlaylist(event, playlist){
    event.stopPropagation();
    console.log("Delete request playlist -> ", playlist);
    var removePlaylist = await fetch(`/public/api/deletePlaylist?playlist=${playlist}&owner=${user}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json'
      } 
    }).then((res) => res.json());
    console.log(removePlaylist);

    if (removePlaylist.success) {
        openToast('success', "Playlist deleted");
        setTimeout( () => {
            fetchPlaylist(user);
        }, 3000);
    } else {
        openToast('error', `${removePlaylist.error}. Please retry later!`)
    }
}

function sharePlaylist(event, playlistName, owner) {
    event.preventDefault();
   // playlistName = "Favourite"
    const params = JSON.stringify({ playlistName, owner });

    const encodedParams = btoa(params);

    const playlistLink = `http://localhost:8080/index.html?data=${encodeURIComponent(encodedParams)}`;

    const shareData = {
        title: `Check out this playlist: ${playlistName}`,
        text: `Hey, check out this playlist "${playlistName}" created by ${owner}!`,
        url: playlistLink
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Successfully shared'))
            .catch((error) => console.error('Error sharing', error));
    } else {
        copyToClipboard(playlistLink);
        alert('Share link copied to clipboard! You can share it on WhatsApp, Instagram, etc.');
    }
}


function copyToClipboard(text) {
    if (!navigator.clipboard) {
      console.log("Clipboard not active");
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }


function getDecodedParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams){
        const encodedParams = urlParams.get('data');
        if (encodedParams) {
            try {
                const decodedParams = JSON.parse(atob(encodedParams));
                console.log('Decoded Parameters:', decodedParams);
                return decodedParams;
            } catch (error) {
                console.error('Error decoding parameters:', error);
            }
        } else {
            console.error('No data parameter found in URL');
        }
    }
    
}

document.addEventListener('DOMContentLoaded', async function () {
    const params = await getDecodedParams()
    if(params){
       // await displayPlaylist(params.playlistName, params.owner)
       await handlePlaylistClick(params.playlistName, params.owner)
    }
});
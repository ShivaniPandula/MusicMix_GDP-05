var songs = [], songsId = [], searchSongs = [], groupedByArtist, groupedByAlbum ;
var dummysong = {
  name: "Fear Song - Devara", 
  artist: "Anirudh Ravichander", 
  duration: "3:16", 
  songUrl: "./songs/Fear Song - Devara.mp3", 
  songId: "Song-01", 
  imgUrl: "./img/fear-song.jpg",
}
var popularTracks = document.getElementById('popularTracks');
var play = document.querySelector('.play');
var skip = document.querySelector('.ion-ios-skipforward');
var skipback = document.querySelector('.ion-ios-skipbackward');
var shuffle = document.querySelector('.ion-shuffle');
var songTimer = document.getElementById('songTimer');
var songProgress = document.getElementById('song-progress');
var volume = document.getElementById('song-volume');
var songLength = document.getElementById('songLength');
var currentSongImg = document.getElementById('currentTrackImg');
var currentSongName = document.getElementById('currentTrackName');
var currentSongArtist = document.getElementById('currentTrackArtist');
var lyricsContainer = document.getElementById('lyrics-container');
var lyricsContent = document.getElementById('lyrics-content');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
var user = localStorage.getItem('user')
var isLyricsAvailable = false

document.addEventListener('DOMContentLoaded', async function () {
  var songsList = await fetch('/public/api/getSongs', {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    } 
  }).then((res) => res.json())
  console.log(songsList);
  if(songsList.success){
    console.log(user)
    var likedList = await fetch(`/public/api/getLikes?user=${user}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        } 
    }).then((res) => res.json())
    console.log(likedList);
    songs = songsList.songs;
    groupedByArtist = songs.reduce((group, song) => {
        const { artist } = song;
        if (!group[artist]) {
          group[artist] = [];
        }
        group[artist].push(song);
        return group;
    }, {});
    console.log(groupedByArtist);
    const artistDiv = document.getElementById('artistsList');
    const artistsSongsDiv = document.getElementById('artistsSongs');
    artistDiv.innerHTML = "";
    artistsSongsDiv.innerHTML = "";
    Object.keys(groupedByArtist).forEach(artist => {
        const artistLink = document.createElement('a');
        artistLink.href = "#";
        artistLink.className = "related-artist";
        artistLink.innerHTML = `
            <span class="related-artist__img">
                <img src="./img/singer-img.png" alt="${artist}" />
            </span>
            <span class="related-artist__name">${artist}</span>
        `;

       
        artistLink.onclick = () => {
            document.getElementById('artistName').innerText = artist
            artistsSongsDiv.innerHTML = "";

            
            groupedByArtist[artist].forEach(song => {
                artistsSongsDiv.innerHTML += `
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
                        </div>
                    </div>
                `;
            });
        };

        
        artistDiv.appendChild(artistLink);
    });
 
    const groupedByAlbum = songs.reduce((albums, song) => {
        const { album } = song;
        if (!albums[album]) {
            albums[album] = [];
        }
        albums[album].push(song);
        return albums;
    }, {});


    const albumDiv = document.getElementById('albumList');
    const albumSongsDiv = document.getElementById('albumTracks');
    const albumImgDiv = document.getElementById('albumImg');

    albumDiv.innerHTML = "";
    albumSongsDiv.innerHTML = "";
    albumImgDiv.src = "";

    const albumNames = Object.keys(groupedByAlbum);
    const firstAlbum = albumNames[0];

    function displayAlbumSongs(album) {
        document.getElementById('albumName').innerText = album; 
        albumSongsDiv.innerHTML = "";
        albumImgDiv.src = "";

        const albumSongs = groupedByAlbum[album];
        const firstSong = albumSongs[0];
        console.log(firstSong)
        albumImgDiv.src = firstSong.imgUrl

        albumSongs.forEach(song => {
            albumSongsDiv.innerHTML += `
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
                    </div>
                </div>
            `;
        });
    }

    albumNames.forEach(album => {
        const albumLink = document.createElement('a');
        albumLink.href = "#";
        albumLink.className = "related-artist";
        albumLink.innerHTML = `
            <span class="related-artist__img">
                <img src="./img/pngegg.png" alt="${album}" />
            </span>
            <span class="related-artist__name">${album}</span>
        `;

        albumLink.onclick = () => displayAlbumSongs(album);

        albumDiv.appendChild(albumLink);
    });

    if (firstAlbum) {
        displayAlbumSongs(firstAlbum);
    }

    songs.reverse()
    popularTracks.innerHTML = ''
        songs.forEach( async(song) => {
        //  console.log(song)
          songsId.push(song.songId)
        //  let term = {songId : song.songId, name: song.name}
         // searchSongs.push(term)
         // console.log(searchSongs)
          let lyricsString = song.lyrics;
          lyricsString = lyricsString
          .replace(/^" *\[/, '[')  
          .replace(/] *"$/, ']');  
          
          try {
            song.lyrics = JSON.parse(lyricsString);
            console.log(song.lyrics)
          } catch (error) {
            console.error("Error parsing JSON:", error.message);
          }

          const songElement = document.createElement('div');
          songElement.classList.add('track');
          songElement.songId = song.songId;
          if(likedList.list && likedList.list.indexOf(song.songId) != -1){
            songElement.innerHTML = `
                <div class="track__art">
                    <img src="${song.imgUrl}" alt="Cover art for '${song.name}'" />
                </div>
                <div class="track__number">
                    <a href="${song.songUrl}" target="_blank" download="${song.name}" title="Download ${song.name}">
                        <ion-icon class="ico-style" name="checkmark-circle"></ion-icon>
                    </a>
                </div>
                <div class="track__added">
                    <i data-song-id="${song.songId}" class="ion-heart added" title="Added to Favorites"></i>
                </div>
                <div class="track__title" id="${song.songId}">
                    ${song.name}  
                </div>
                <div class="track__explicit">
                    <span class="label">${song.album}</span>
                </div>
                <div class="track__plays">
                    <span class="label">${song.duration}</span>
                    <a href="#" onclick="showAddToPlaylistDialog('${song.songId}')"><span class="plus">&plus;</span></a>
                </div>
            `;
          } else {
            songElement.innerHTML = `
                  <div class="track__art">
                      <img src="${song.imgUrl}" alt="Cover art for '${song.name}'" />
                  </div>
                  <div class="track__number">
                      <a href="${song.songUrl}" download="${song.name}" target="_blank" title="Download ${song.name}">
                          <ion-icon class="ico-style" name="checkmark-circle"></ion-icon>
                      </a>
                  </div>
                  <div class="track__added">
                      <i data-song-id="${song.songId}" class="ion-heart not-added" title="Added to Favorites"></i>
                  </div>
                  <div class="track__title" id="${song.songId}">
                      ${song.name}  
                  </div>
                  <div class="track__explicit">
                      <span class="label">${song.album}</span>
                  </div>
                  <div class="track__plays">
                      <span class="label">${song.duration}</span>
                      <a href="#" onclick="showAddToPlaylistDialog('${song.songId}')"><span class="plus">&plus;</span></a>
                  </div>
              `;
          }
          
            console.log(songElement)
            popularTracks.appendChild(songElement);
        })

        document.querySelectorAll('.track__title').forEach(element => {
          element.addEventListener('click', function() {
              playSong(this.id);
          });
        });

        document.querySelectorAll('.ion-heart').forEach(element => {
            element.addEventListener('click', async function() {
                if (this.classList.contains('not-added')) {
                    this.classList.remove('not-added');
                    this.classList.add('added');
                    await fetch(`/public/api/likeSong?user=${user}&id=${this.dataset.songId}&action=like`,{ method: 'GET', headers: { 'Content-Type': 'application/json' }})
                } else {
                    this.classList.remove('added');
                    this.classList.add('not-added');
                    await fetch(`/public/api/likeSong?user=${user}&id=${this.dataset.songId}&action=unlike`,{ method: 'GET', headers: { 'Content-Type': 'application/json' }}) 
                }
            });
        });

        searchInput.addEventListener('input', function () {
          const query = searchInput.value.toLowerCase();
          searchResults.innerHTML = '';

          if (query) {
              const filteredSongs = songs.filter(song => song.name.toLowerCase().includes(query));

              filteredSongs.forEach(song => {
                  const option = document.createElement('div');
                  option.textContent = song.name;
                  option.dataset.songId = song.songId;
                  option.addEventListener('click', function () {
                      playSong(song.songId);
                      searchResults.innerHTML = '';
                      searchInput.value = ''; 
                  });
                  searchResults.appendChild(option);
              });
          }
      });
  }
  
});


var list = songs;
var currentSongId = 0,
    currentIndex = 0,
    isPlaying = false,
    progressUpdateInterval,
    currentLyricIndex = -1; 
var search = false;
var audio = new Audio(dummysong.songUrl);


 songLength.innerText = dummysong.duration;
 currentSongImg.src = dummysong.imgUrl;
 currentSongArtist.innerText = dummysong.artist;
 currentSongName.innerText = dummysong.name;



noUiSlider.create(songProgress, {
    start: 0,
    range: {
        'min': 0,
        'max': 100
    },
    connect: 'lower'
}).on('slide', function(values, handle){
    audio.currentTime = (values[handle] / 100) * audio.duration;
});

noUiSlider.create(volume, {
    start: 70,
    range: {
        'min': 0,
        'max': 100
    },
    connect: 'lower'
}).on('slide', function(values, handle){
    audio.volume = values[handle] / 100;
});


play.addEventListener('click', function() {
    if(isPlaying) {
        audio.pause();
    } else {
        audio.play();
       // storeSongData();
    }
});


skip.addEventListener('click', function() {
    currentIndex = (currentIndex + 1) % songs.length; 
    console.log("currentindex - ", currentIndex)
    playSong(songsId[currentIndex]);
});

skipback.addEventListener('click', function() {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length; 
    playSong(songsId[currentIndex]);
});

shuffle.addEventListener('click', function() {
    currentIndex = Math.floor(Math.random() * songs.length);
    playSong(songsId[currentIndex]);
});

audio.addEventListener('ended', function() {
    currentIndex = (currentIndex + 1) % songs.length;
    playSong(songsId[currentIndex]);
    clearInterval(progressUpdateInterval);
});

audio.addEventListener('play', function() {
    console.log("Audio playing...")
    isPlaying = true;
    play.classList.add('ion-ios-pause');
    play.classList.remove('ion-ios-play');
    progressUpdateInterval = setInterval(updateProgress, 1000);
});


audio.addEventListener('pause', function() {
    isPlaying = false;
    console.log("Audio paused...")
    clearInterval(progressUpdateInterval);
    play.classList.remove('ion-ios-pause');
    play.classList.add('ion-ios-play');
});

function findSong(index) {
    console.log(index); // Log the index to the console

    if (search) { 
        let song = songsList.list.find((song) => song.id == index);
        currentIndex = songsList.list.findIndex(song => song.id == index);
        
        if (song) {
            playSong(currentIndex); // Use index to play the song
            sessionStorage.setItem('currentSong', JSON.stringify(song.lyrics));
            sessionStorage.setItem('currentIndex', currentIndex);
        } else {
            alert('No songs to play'); // If no song is found, show an alert
        }
    } else {
        alert('Search is not enabled'); // Alert if 'search' is not true
    }
}

function playSong(songIndex) {
    console.log("Playsong ", songIndex)
    let songId = songsId.indexOf(songIndex);
    console.log("Music Id ", songId, songs[songId])
    if(songId != -1){
      let song = songs[songId];
      audio.src = song.songUrl;
      songLength.innerText = song.duration;
      currentSongImg.src = song.imgUrl;
      currentSongId = songId;
      currentSongArtist.innerText = song.artist;
      currentSongName.innerText = song.name;
      currentLyricIndex = -1;
      currentIndex = songId;
      sessionStorage.setItem('currentIndex', currentIndex);
      console.log(song.lyrics)
      if (song.lyrics.length > 1) displayLyrics(song.lyrics);
      console.log(audio)
      audio.play();
    }
    
}


function storeSongData() {
    let playedSongs = JSON.parse(localStorage.getItem('playedSongs')) || [];
    let songData = {
        title: songs[currentIndex].title,
        artist: songs[currentIndex].artist,
        timestamp: new Date().toLocaleString()
    };
    playedSongs.push(songData);
    localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
}


function updateProgress() {
    if (!isNaN(audio.duration)) {
        var progress = (audio.currentTime / audio.duration) * 100;
        songProgress.noUiSlider.set(progress);
    }
    var minutes = Math.floor(audio.currentTime / 60);
    var seconds = Math.floor(audio.currentTime % 60);
    songTimer.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // console.log("timer -> ",`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, songTimer.innerText)
    
   // updateLyrics(audio.currentTime, songs[currentSongId].lyrics); 
}


function displayLyrics(lyrics) {
    lyricsContent.innerHTML = lyrics.map((lyric, index) => `<h5 id="line-${index}">${lyric.lyric}</h5>`).join('');
}


function updateLyrics(currentTime, lyrics) {
    const bufferTime = 1; 

    let newLyricIndex = lyrics.findIndex((lyric, index) =>
        (currentTime + bufferTime) >= lyric.start && (currentTime + bufferTime) < (lyrics[index + 1]?.start || Infinity)
    );

    if (newLyricIndex !== currentLyricIndex) {
        currentLyricIndex = newLyricIndex;

        document.querySelectorAll('#lyrics-content h5').forEach(el => el.classList.remove('current'));
        var currentLyricElement = document.getElementById(`line-${currentLyricIndex}`);
        if (currentLyricElement) {
            currentLyricElement.classList.add('current');
            centerize();
        }
    }
}



function centerize() {
    var currentLyric = document.querySelector('.current');
    if (!currentLyric) return;

    var containerHeight = 350; 
    var lyricHeight = currentLyric.clientHeight;
    var lyricOffsetTop = currentLyric.offsetTop;

    var scrollPosition = lyricOffsetTop - (containerHeight / 2) + (lyricHeight / 2);

    lyricsContainer.scrollTo({
        top: scrollPosition,
        behavior: 'smooth' 
    });
}


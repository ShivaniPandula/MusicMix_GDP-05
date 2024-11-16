var user = localStorage.getItem('user');
const recommendedSongsdiv = document.getElementById('recommendedSongsdiv');
var recommendedSongs
document.addEventListener('DOMContentLoaded', async function () {
    await fetchRecommendSongs(user);
})

async function fetchRecommendSongs(user) {
    var fetchList = await fetch(`/public/api/getRecommendations?id=${user}`, {
      method: 'GET',
      headers: {
          'Accept': 'application/json'
      } 
    }).then((res) => res.json())
    console.log(fetchList);
    if(fetchList.songs){
        recommendedSongs = fetchList.songs;
        recommendedSongsdiv.innerHTML = '';
        recommendedSongs.forEach(song => {
            recommendedSongsdiv.innerHTML += `
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
    } else {
        console.log('No songs recommended');
        recommendedSongsdiv.innerHTML = `<h1 style="text-align: center; font-weight: bold; font-size: 22px;">Personal recommendation is empty...</h1>`
    }
}
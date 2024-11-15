const tableDiv = document.getElementById('songsTable');
const poupDiv = document.getElementById('editSongPopup');
document.addEventListener('DOMContentLoaded', async function () {
   await getSongs();
});

// Fetch and render songs in the table
async function getSongs(){
    const songList = await fetch('/admin/api/getSongs', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        } 
    }).then((res) => res.json());

    console.log(songList);

    if(songList.success){
        var x  = '';
        tableDiv.innerHTML = "";
        songList.songs.forEach((song) => {
            if(song.songId){
                x = `<tr>
                <td>${song.name}</td>
                <td>${song.album}</td>
                <td>${song.year}</td>
                <td>${song.artist}</td>
                <td>${song.lyrics.length > 2 ? 'Yes' : 'No'}</td>
                <td>
                    <button data-id=${song._id} class="edit-button"><ion-icon name="ellipsis-vertical-circle-sharp"></ion-icon></button>
                    <button data-id=${song._id} class="delete-button"><ion-icon name="trash"></ion-icon></button>
                </td>
            </tr>`;
            }
            tableDiv.innerHTML += x;
        });
    }
}

// Handle Edit and Delete button clicks
document.addEventListener('click', async function (event) {
    // Handle Edit button click
    if (event.target.closest('.edit-button')) {
        const songId = event.target.closest('.edit-button').getAttribute('data-id');
        const song = await getSongData(songId);

        // Populate the popup with the song data
        let popupContent = `
            <div class="popup-content">
                <span class="close" id="closePopup" onclick="document.getElementById('editSongPopup').style.display = 'none'"><b>&times;</b></span>
                <h3 style="text-align: center; margin-bottom: 20px;">EDIT SONG</h3>
                <form id="editSongForm">
                    <div class="img" style="display: none;">
                        <img id="edit-imgbg" src="${song.imgUrl}" onclick="document.getElementById('fileInput').click()">
                        <input id="edit-fileInput" name="image" type="file" style="display:none;" onchange="changeimg()" />
                    </div>
                    <label for="name">Music Name:</label>
                    <input type="text" name="name" id="edit-name" required value="${song.name}">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="album">Album :</label>
                            <input id="edit-album" name="album" type="text" required value="${song.album}">
                        </div>
                        <div class="form-group">
                            <label for="duration">Duration :</label>
                            <input id="edit-duration" name="duration" type="text" required value="${song.duration}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="artist">Artist :</label>
                            <input type="text" name="artist" id="edit-artist" required value="${song.artist}">
                        </div>
                        <div class="form-group">
                            <label for="year">Year :</label>
                            <input id="edit-year" name="year" type="number" required value="${song.year}">
                        </div>
                    </div>
                    <label for="file" style="display: none;">Music File:</label>
                    <input style="display: none;" type="file" name="file" id="edit-file" accept=".mp3"/>
                    <label for="lyrics">Lyrics :</label>
                    <textarea id="edit-lyrics" name="lyrics">${song.lyrics}</textarea>
                    <input type="hidden" id="edit-songId" name="songId" value="${songId}">
                    <div style="display: flex; justify-content: center;">
                        <button class="btn" id="btn" type="submit">Update</button>
                    </div>
                </form>
            </div>`;
        
        poupDiv.innerHTML = popupContent;
        document.getElementById('editSongPopup').style.display = 'block';

        document.getElementById('editSongForm').onsubmit = async function (event) {
            event.preventDefault();

            var formData = new FormData();
           
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

           // const songFile = document.getElementById('edit-file').files[0];
          //  const imgFile = document.getElementById('edit-fileInput').files[0];
            const songName = document.getElementById('edit-name').value;
            const albumName = document.getElementById('edit-album').value;
            const artistName = document.getElementById('edit-artist').value;
            const year = document.getElementById('edit-year').value;
            const lyrics = document.getElementById('edit-lyrics').value;
            const duration = document.getElementById('edit-duration').value;

           // songFile ? formData.append('song', songFile) : 0
            formData.append('name', songName);
            formData.append('album', albumName);
            formData.append('artist', artistName);
            formData.append('duration',duration);
            formData.append('year', year);
            formData.append('lyrics', lyrics);
           // imgFile ? formData.append('image', imageBlob, `${songName}.png`) : 0
            

            const formDataObject = {};
            formData.forEach((value, key) => {
               formDataObject[key] = value;
            });

            console.log(formDataObject)
            const songId = document.getElementById('edit-songId').value; 

            try {
                const response = await axios.post(`/admin/api/editSong?id=${songId}`, JSON.stringify(formDataObject), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
        
                console.log(response);
        
                if (response.data) {

                    document.getElementById('editSongPopup').style.display = 'none'; 
                    alert('Music data updated successfully!');
                    getSongs(); 
                } else {
                    throw new Error('No response data');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while uploading the Music. Please try again.');
            }
        };
    }

    // Handle Delete button click
    if (event.target.closest('.delete-button')) {
        const songId = event.target.closest('.delete-button').getAttribute('data-id');
        deleteSong(songId);
    }
});

// Function to delete a song
async function deleteSong(songId) {
    console.log(songId)
    await fetch(`/admin/api/deleteSong?id=${songId}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        alert("Music Deleted");
        console.log('Music deleted successfully:', data);
        getSongs();
    })
    .catch(error => {
        console.error('Error deleting Music:', error);
        alert("Failed to delete Music");
    });
}

// Fetch a single song's data
async function getSongData(songId) {
    const response = await fetch(`/admin/api/getSong?id=${songId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    const song = await response.json();
    console.log(song);
    
    if (song.song) {
        return song.song; // Return the song object directly
    } else {
        alert("Failed to fetch Music details");
        window.location.reload(true);
    }
}


const editfile = document.getElementById('edit-fileInput');
const editimgContainer = document.getElementById('edit-imgbg');
function changeimg() {
    
    if (editfile.files.length > 0) {
        const selectedImage = editfile.files[0];
        const objectURL = URL.createObjectURL(selectedImage);
        editimgContainer.src = objectURL;

        if (editimgContainer.src.startsWith('blob:')) {
                    fetch(editimgContainer.src)
                        .then(response => response.blob())
                        .then(blob => {
                            imageBlob = blob;
                            console.log({ file: imageBlob, type: imageBlob.type });
                        })
                        .catch(error => console.error('Failed to fetch blob image:', error));
        } else {
                    console.log('No valid image metadata or blob URL found.');
        }
    }
}

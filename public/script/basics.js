var username = localStorage.getItem('name')
const profileUrl = localStorage.getItem('profileUrl')

if(username ) document.getElementById('username').innerHTML = username

if(profileUrl)  document.getElementById('profileUrl').src = profileUrl

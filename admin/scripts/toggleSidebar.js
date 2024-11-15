// Toggle sidebar and body class when sidebar button is clicked
document.querySelector('.sidebarbtn').addEventListener('click', function() {
    document.getElementById('mySidenav').classList.toggle('active');
    document.body.classList.toggle('active');
});

// Remove 'active' class from sidebar and body when close button is clicked
document.querySelector('.closebtn').addEventListener('click', function() {
    document.getElementById('mySidenav').classList.remove('active');
    document.body.classList.remove('active');
});
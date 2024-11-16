var user = localStorage.getItem('user'),
    token = localStorage.getItem('token')
    console.log(user, token)

if(!user && !token){
    window.location.href="login.html"
}
    

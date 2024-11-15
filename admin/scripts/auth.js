var admin = sessionStorage.getItem('admin'),
    token = sessionStorage.getItem('token')
    console.log(admin, token)

if(!admin && !token){
    window.location.href="login.html"
}


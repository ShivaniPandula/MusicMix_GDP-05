
const form = document.getElementById('loginForm');
const resetForm = document.getElementById('resetPassForm')

form.addEventListener('submit', async(e) => {
    e.preventDefault();
  //  openToast('info', 'Signup Form Submitted')
    console.log("Login Form submitted");
    // Get form data
    const formData = new FormData(e.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);

   const login = await fetch('/public/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formDataObject),
    }).then((res) => res.json())

    if(login.success){
        localStorage.setItem('user', login.user.email)
        localStorage.setItem('token', login.token)
        localStorage.setItem('name', login.user.name)
        localStorage.setItem('dob', login.user.dob)
        localStorage.setItem('address', login.user.address)
        if(login.user.profileUrl) localStorage.setItem('profileUrl', login.user.profileUrl)
        openToast('success', "Login Success");
        setTimeout( () => {
            window.location.href="index.html"
        }, 6000)
    } else {
        openToast('error', `${login.error}`)
    }

})

resetForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    openToast('info', 'Reset Pass request initiated')
    console.log("Signup Form submitted");
    // Get form data
    const formData = new FormData(e.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);

   const request = await fetch('/public/api/resetPasswordRequest', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formDataObject),
    }).then((res) => res.json())

    if(request.success){
        openToast('success', request.success);
        setTimeout( () => {
           document.getElementById('resetPassPopup').style.display = 'none'
           window.location.reload('true')
        }, 6000)
    } else {
        openToast('error', `${request.error}. Please retry later!`)
    }

})
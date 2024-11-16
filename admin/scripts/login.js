const form = document.getElementById('loginForm');
// const resetForm = document.getElementById('resetPassForm')

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    openToast('info', 'Login Form Submitted')
    console.log("Signup Form submitted");
    // Get form data
    const formData = new FormData(e.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);

    const login = await fetch('/admin/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject),
        }).then((res) => res.json())

        if(login.success){
            openToast('success', "Login Success");
            sessionStorage.setItem('admin', login.user.email)
            sessionStorage.setItem('token', login.token)
            sessionStorage.setItem('name', login.user.name)
            setTimeout( () => {
                window.location.href="index.html"
            }, 6000)
        } else {
            openToast('error', `${login.error}. Please retry later!`)
        }

})
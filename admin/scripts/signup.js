
const form = document.getElementById('signupForm');

var userData

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    openToast('info', 'Signup Form Submitted')
    console.log("Signup Form submitted");
    // Get form data
    const formData = new FormData(e.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);
   
   if(formDataObject.password !== formDataObject.password2){
        console.log("Password and confirm password mismatch");
        openToast('error', "Password and confirm password need to be same!");
        return
   }

   const response = await fetch('/admin/api/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formDataObject),
    }).then((res) => res.json())

    if(response.success){
        openToast('success', "Account Created Successfully!");
        setTimeout( () => {
            window.location.href="login.html"
        }, 6000)
    } else {
        openToast('error', "Something went wrong!, Please try again later")
    }

})

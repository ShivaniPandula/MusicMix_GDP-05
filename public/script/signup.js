function changeimg() {
    const file = document.getElementById('fileInput');
    const imgContainer = document.getElementById('imgbg');
    
    if (file.files.length > 0) {
        const selectedImage = file.files[0];
        const objectURL = URL.createObjectURL(selectedImage);
        imgContainer.src = objectURL;
    }
}

const form = document.getElementById('signupForm');
const popup = document.getElementById('verifyMail');
const OTPForm = document.getElementById('checkOTP');
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

   const sendOTP = await fetch('/public/api/sendOTP', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formDataObject),
    }).then((res) => res.json())

    if(sendOTP.success){
        openToast('success', "OTP Sent successfully!");
        popup.style.display = "block";
        userData = formDataObject
        
    } else {
        openToast('error', `${sendOTP.error}. Please retry later!`)
       // setTimeout(window.location.reload(), 6000)
    }

})

OTPForm.addEventListener('submit', async(e) => {
    openToast('info', 'Mail Verification Initiated')
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('email', userData.email)
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);
    const checkOTP = await fetch('/public/api/checkOTP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
        }).then((res) => res.json())
        
        if(checkOTP.success){
            openToast('success', "OTP verified successfully!");
            popup.style.display = "hidden";
            userData.image = await fetch(document.getElementById('imgbg').src).then((res) => res.blob());
            userData.verified = true;

            const response = await axios.post('/public/api/register', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            });
            
                if(response.data){
                    openToast('success', "Account Created Successfully!");
                    setTimeout( () => {
                        window.location.href="login.html"
                    }, 6000)
                } else {
                    openToast('error', "Something went wrong!, Please try again later")
                }
        } else {
            openToast('error', `${checkOTP.error}. Please retry after 5 seconds`)
        }
        
})

console.log(window.location.href)
const decrypt = atob(window.location.href.split('?')[1])
const urlParams = new URLSearchParams(decrypt);
var id = urlParams.get('id');
var token = urlParams.get('token');
console.log(id,token)

const changePasswordForm = document.getElementById("resetForm")

changePasswordForm.addEventListener('submit',async (e)=>{

    e.preventDefault()

    const password =document.getElementById("password").value
    const password2 =document.getElementById("password2").value
    if(password.toString().toLowerCase() == password2.toString().toLowerCase()){
            const result = await fetch(`/public/api/changePassword?id=${id}&token=${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password:password,
            })
        }).then((res) => res.json())
        console.log(result,"result")
        if (result.success) {
            openToast("success", "Password changed successfully")
        } else {
            openToast("error" , result.error)
        }
    } else {
        openToast("warning","Please enter same passwords")
    }

})

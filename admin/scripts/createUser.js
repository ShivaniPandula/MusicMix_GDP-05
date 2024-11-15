const form = document.getElementById('addUserForm');
// const resetForm = document.getElementById('resetPassForm')

form.addEventListener('submit', async(e) => {
    e.preventDefault();
    openToast('info', 'Create user Form Submitted')
   // console.log("Signup Form submitted");
    // Get form data
    const formData = new FormData(e.target);
    const formDataObject = {};
    formData.forEach((value, key) => {
        formDataObject[key] = value;
    });
    console.log(formDataObject);

    const createAccount = await fetch('/admin/api/createUserAccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject),
        }).then((res) => res.json())

        if(createAccount.success){
            openToast('success', "User account created successfully");
            setTimeout( () => {
                window.location.reload('true')
            }, 6000)
        } else {
            openToast('error', `${createAccount.error}. Please retry later!`)
        }

})
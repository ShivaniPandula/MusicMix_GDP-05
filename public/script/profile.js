
const username = localStorage.getItem('name')
const profileUrl = localStorage.getItem('profileUrl')
const mail = localStorage.getItem('user')
const dob = localStorage.getItem('dob')
const address = localStorage.getItem('address')
const editButton = document.getElementById('editButton')
const saveButton = document.getElementById('saveButton')
var profileChanged = false
const form = new FormData();

if(username ) document.getElementById('name').innerHTML = username

if(profileUrl)  document.getElementById('profileUrl').src = profileUrl

if(mail) document.getElementById('email').innerHTML = mail

if(dob) document.getElementById('dob').innerHTML = dob

if(address) document.getElementById('address').innerHTML = address


document.getElementById('profileUrl').addEventListener('click', () => {
    document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profileUrl').src = e.target.result;
        };

        reader.readAsDataURL(file);
        profileChanged = true
    }
});

editButton.addEventListener('click', () => {
    let fields = ['name', 'email', 'address', 'dob'];
    
    fields.forEach(id => {
        let element = document.getElementById(id);
        element.contentEditable = true;
        element.classList.add('editable');
    });
    editButton.hidden = true;
    saveButton.hidden = false;
});

document.getElementById('saveButton').addEventListener('click', async () => {

    let fields = ['name', 'email', 'address', 'dob'];
    let updatedData = {};
    // Disable editing and remove the highlight
    fields.forEach(id => {
        let element = document.getElementById(id);
        element.contentEditable = false;
        element.classList.remove('editable');
        form.append(id, element.textContent);
    });

    
    let url = await fetch(document.getElementById('profileUrl').src).then((res) => res.blob())
    form.append('image', url);
    form.append('user',localStorage.getItem('user'))
    // Toggle buttons visibility
    document.getElementById('editButton').hidden = false;
    document.getElementById('saveButton').hidden = true;
    form.forEach((value, key) => {
        updatedData[key] = value;
    });
 
    console.log(form);

    const response = await axios.post('/public/api/updateProfile', form, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
    
    if(response.data){
        openToast('success', "Profile updated Successfully!");
        localStorage.setItem('user', response.data.user.email)
       // localStorage.setItem('token', response.data.token)
        localStorage.setItem('name', response.data.user.name)
        localStorage.setItem('dob', response.data.user.dob)
        localStorage.setItem('address', response.data.user.address)
        localStorage.setItem('profileUrl', response.data.user.profileUrl)
        setTimeout( () => {
            window.location.reload("true")
        }, 6000)
    } else {
        openToast('error', "Something went wrong!, Please try again later")
    }
});


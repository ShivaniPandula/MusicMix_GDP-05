var toast, toastTimer, closeToastBtn,countdown, closeToast, openToast
document.addEventListener('DOMContentLoaded', async function () {
    toast = document.querySelector("#toast");
    toastTimer = document.querySelector("#timer");
    closeToastBtn = document.querySelector("#toast-close");

    closeToast = () => {
    toast.style.animation = "close 0.3s cubic-bezier(.87,-1,.57,.97) forwards";
    toastTimer.classList.remove("timer-animation");
    clearTimeout(countdown)
    }

    openToast = (type, message) => {
    toast.style.display = "flex"
    toast.getElementsByTagName("P")[0].innerHTML = message
    toast.classList = [type];
    toast.style.animation = "open 0.3s cubic-bezier(.47,.02,.44,2) forwards";
    toastTimer.classList.add("timer-animation");
    clearTimeout(countdown)
    countdown = setTimeout(() => {
        closeToast();
    }, 5000)
    }

    closeToastBtn.addEventListener("click", closeToast)
})

/*


const toast = document.querySelector("#toast");
const toastTimer = document.querySelector("#timer");
const closeToastBtn = document.querySelector("#toast-close");
let countdown

const closeToast = () => {
  toast.style.animation = "close 0.3s cubic-bezier(.87,-1,.57,.97) forwards";
  toastTimer.classList.remove("timer-animation");
  clearTimeout(countdown)
}

const openToast = (type, message) => {
  toast.style.display = "flex"
  toast.classList = [type];
  toast.style.animation = "open 0.3s cubic-bezier(.47,.02,.44,2) forwards";
  toastTimer.classList.add("timer-animation");
  clearTimeout(countdown)
  countdown = setTimeout(() => {
    closeToast();
  }, 5000)
}

closeToastBtn.addEventListener("click", closeToast)

*/
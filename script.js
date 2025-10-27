document.addEventListener("DOMContentLoaded", () => {
    //constants
    const fileInput = document.getElementById("photoFile");
    const imagePreview = document.getElementById("imagePreview");
    //running functions
    timeGreeting();

    loadPhoto;
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                imagePreview.src = imageUrl;
                savePhoto(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });
});

//functions
//automatic greeting based on time
function timeGreeting(){
    const hour = new Date().getHours();
    const greetingElement = document.getElementById("greeting");
    if (hour < 12){
        greetingElement.innerHTML = "good morning, bloomer.";
    } else if (hour < 18){
        greetingElement.innerHTML = "good afternoon, bloomer.";
    } else{
        greetingElement.innerHTML = "good evening, bloomer.";
    }
}
//saves photo to chrome's storage
function savePhoto(imageUrl){
    chrome.storage.local.set({uploadedPhoto: imageUrl}, () => {
        console.log("photo saved to storage");
    });
}
//loads previously saved images from chrome's storage
function loadPhoto(){
    chrome.storage.local.get("uploadedPhoto", (data) => {
        if (data.uploadedPhoto){
            imagePreview.src = data.uploadedPhoto;
        }
    });
}
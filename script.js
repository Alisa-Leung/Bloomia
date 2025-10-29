document.addEventListener("DOMContentLoaded", () => {
    //constants
    const fileInput = document.getElementById("photoFile");
    const imagePreview = document.getElementById("imagePreview");
    const imageContainer = document.getElementById("galleryContainer");
    //running functions
    timeGreeting();
    loadGallery();

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
        greetingElement.innerHTML = "Good morning, bloomer.";
    } else if (hour < 18){
        greetingElement.innerHTML = "Good afternoon, bloomer.";
    } else{
        greetingElement.innerHTML = "Good evening, bloomer.";
    }
}
//saves photo to chrome's local storage
function savePhoto(imageUrl){
    chrome.storage.local.set({uploadedPhoto: imageUrl}, () => {
        console.log("photo saved to storage");
    });
}
//loads previously saved images from chrome's storage and gallery when extension is opened
function loadGallery(){
    chrome.storage.local.get(['gallery'], (result) => {
        chrome.storage.local.get("uploadedPhoto", (data) => {
            if (data.uploadedPhoto){
                const img = document.createElement('img');
                img.src = data.uploadedPhoto;
                img.className = 'galleryImage';
                container.appendChild(img);
                imagePreview.src = data.uploadedPhoto;
            }
        });
    });
}
//event listeners
document.addEventListener("DOMContentLoaded", () => {
    //constants
    const buttons = document.getElementsByClassName("customButton");
    //running functions
    document.getElementById("photoFile").addEventListener("change", (event) => {
        //checks if there have been files uploaded
        const files = event.target.files;
        if (files.length === 0){
            return;
        }
        //finds data url of uploaded images
        const readers = [];
        for (let i = 0; i < files.length; i ++){
            const file = files[i];
            const reader = new FileReader();
            readers.push(new Promise((resolve) =>{
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            }));
        }
        Promise.all(readers).then(newImageUrls => {
            chrome.storage.local.get(["uploadedImages"], (result) => {
                const existingImages = result.uploadedImages || [];
                const allImages = [...existingImages, ...newImageUrls];

                chrome.storage.local.set({uploadedImages: allImages}, () => {
                    displayImages(allImages);
                });
            })
        });
    });
    document.getElementById("clearImages").addEventListener("click", (event) => {
        clearStoredImages();
    })
    //styling buttons and their children
    Array.from(buttons).forEach(button =>{
        button.addEventListener("mouseenter", () => {
            Array.from(button.children).forEach(child => {
                child.style.backgroundColor = "#fdaaaa";
            });
        });
        button.addEventListener("mouseleave", () => {
            Array.from(button.children).forEach(child => {
                child.style.backgroundColor = "#ffd5d5";
            });
        });
    })
    timeGreeting();
    loadAndDisplayImages(); //update for later: make it so that only one image appears -- right now its reiterating the list and re-displaying every item
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
//function that takes in an array of image urls and appendds all of them to the gallery div
function displayImages(imageUrls){
    const displayElement = document.getElementById("gallery");
    displayElement.innerHTML = "";
    imageUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "galleryImage";
        displayElement.appendChild(img);
        checkOverflow(document.getElementById("gallery"));
    });
}
//function that loads images from storage and runs the displayimages() function
function loadAndDisplayImages(){
    chrome.storage.local.get(["uploadedImages"], (result) => {
        const imageUrls = result.uploadedImages || [];
        displayImages(imageUrls);
    });
}
//clears images
function clearStoredImages(){
    chrome.storage.local.remove("uploadedImages", () => {
        const displayElement = document.getElementById("gallery");
        displayElement.innerHTML = "";
    });
}
//checks if there is overflow to adjust spacing
function checkOverflow(element){
    const isOverflowing = element.scrollHeight > element.clientHeight;
    const galleryImages = document.getElementsByClassName("galleryImage");
    if (isOverflowing){
        Array.from(galleryImages).forEach(galleryImage => {
            galleryImage.style.width = "75px";
            galleryImage.style.height = "75px";
        });
    } else {
        Array.from(galleryImages).forEach(galleryImage => {
            galleryImage.style.width = "80px";
            galleryImage.style.height = "80px";
        })
    }
}
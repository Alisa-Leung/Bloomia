//gemini api key
const geminiAPIKey = "AIzaSyCnwR6MvId-bK9c4p6-fQ0XRhfAb5FwbNY";

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
    imageUrls.forEach((url, index) => {
        const img = document.createElement("img");
        img.src = url;
        img.className = "galleryImage";
        //ai stuff
        img.dataset.index = index;
        img.addEventListener("click", () => analyzePlant(url, img));
        
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
//plant analysis
async function analyzePlant(imageUrl, imgElement){
    try{
        //visually loading
        imgElement.style.border = "3px solid #59ac77";
        showAnalysisResult("Analyzing your plant...");
        //info from data url
        const base64Data = imageUrl.split(",")[1];
        const mimeType = imageUrl.split(";")[0].split(":")[1];
        //api call
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiAPIKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `You are a plant expert. Analyze this image and provide the following:
                                1. Is this a plant? (yes/no answer only)
                                2. If yes, what type of plant is it? (common name and scientific name if possible)
                                3. Brief care tips (watering, sunlight, special notes; please write in full sentences)
                                Keep your response concise and friendly.
                                Format as:
                                **Is this a plant?** [answer]
                                **Plant type:** [name]
                                **Care tips:** [tips]`

                            },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }]
                })
            }
        );
        if (!response.ok){
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        showAnalysisResult(result);
    } catch (error){
        console.error("Analysis error:", error);
        showAnalysisResult(`Error: ${error.message}`);
    } finally {
        setTimeout(() => {
            imgElement.style.border = "none";
        }, 2000);
    }
}
function showAnalysisResult(message){
    const existingModal = document.getElementById("analysisModal");
    if (existingModal){
        existingModal.remove();
    }
    const modal = document.createElement("div");
    modal.id = "analysisModal";
    modal.className = "modal";
    const modalContent = document.createElement("div");
    modalContent.className = "modalContent";
    const closeButton = document.createElement("span");
    closeButton.className = "closeModal";
    closeButton.innerHTML = "x";
    closeButton.onclick = () => modal.remove();
    const resultText = document.createElement("div");
    resultText.className = "analysisText";
    resultText.innerHTML = message.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    modalContent.appendChild(closeButton);
    modalContent.appendChild(resultText);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal){
            modal.remove();
        }
    }
}
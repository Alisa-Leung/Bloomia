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
    document.getElementById("clearImageButton").addEventListener("click", (event) => {
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
        const modal = document.getElementById("modal");
        modal.remove();
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
        const loadingBar = document.createElement("hr");
        const existingBar = document.getElementById("loadingBar");
        if (existingBar){
            existingBar.remove();
        }
        loadingBar.style.backgroundColor = "#59ac77";
        loadingBar.style.width = "0%";
        loadingBar.style.height = "16px";
        loadingBar.style.border = "none";
        loadingBar.style.borderRadius = "8px";
        loadingBar.style.margin = "0";
        loadingBar.style.marginTop = "8px";
        loadingBar.style.marginBottom = "8px";
        loadingBar.style.display = "block";
        loadingBar.id = "loadingBar";
        loadingBar.style.transition = "width 0.2s ease-in-out";
        document.getElementById("bar").append(loadingBar);
        showAnalysisResult("Analyzing your plant...");
        //animated progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 100){
                progress += Math.random()*20
                loadingBar.style.width = `${Math.min(progress, 90)}%`;
            }
        }, 300);
        //info from data url
        const base64Data = imageUrl.split(",")[1];
        const mimeType = imageUrl.split(";")[0].split(":")[1];
        loadingBar.style.width = "50%";
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
                                1. If this is indeed a plant, what type of plant is it? (common name and scientific name if possible); if it is not a plant, please indicate so.
                                2. Brief care tips that are specific to the state of the image; the state of the plant is acknowledged in the tips (watering, sunlight, special notes; please write in full sentences)
                                Keep your response concise and friendly.
                                Format as:
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
            loadingBar.style.width = "100%";
            loadingBar.style.transition = "opacity 0.5s ease";
            loadingBar.style.opacity = "0";
            setTimeout(() => loadingBar.remove(), 500);
        }, 500);
    }
}
//creates section at the bottom of the extension
function showAnalysisResult(message){
    const existingModal = document.getElementById("analysisModal");
    if (existingModal){
        existingModal.remove();
    }
    const modal = document.createElement("div");
    modal.id = "analysisModal";
    modal.className = "modal";
    modal.style.padding = "8px";
    const modalContent = document.createElement("div");
    modalContent.className = "modalContent";
    const resultText = document.createElement("div");
    resultText.className = "analysisText";
    resultText.innerHTML = message.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    if (message == "Analyzing your plant..."){
        resultText.style.display = "flex";
        resultText.style.justifyContent = "center";
    } else{
        resultText.style.justifyContent = "left";
    }
    modalContent.appendChild(resultText);
    modal.appendChild(modalContent);
    document.getElementById("modalDiv").appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal){
            modal.remove();
        }
    }
}
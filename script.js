document.addEventListener("DOMContentLoaded", () => {
    //constants
    const fileInput = document.getElementById("photoFile");
    const imagePreview = document.getElementById("imagePreview");
    const imageGallery = document.getElementsByClassName("galleryImage");
    //running functions
    timeGreeting();

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
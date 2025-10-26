//automatic greeting based on time
document.addEventListener("DOMContentLoaded", function(){
    const hour = new Date().getHours();
    var greetingElement = document.getElementById("greeting");
    if (hour < 12){
        greetingElement.innerHTML = "good morning, bloomer.";
    } else if (hour < 18){
        greetingElement.innerHTML = "good afternoon, bloomer.";
    } else{
        greetingElement.innerHTML = "good evening, bloomer.";
    }
});
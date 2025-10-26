//automatic greeting based on time
const hour = new Date().getHours();
const greetingElement = document.getElementById("greeting");
let greetingMessage;
if (hour < 12){
    greetingMessage = "good morning, bloomer";
} else if (hour < 18){
    greetingMessage = "good afternoon, bloomer";
} else{
    greetingMessage = "good evening, bloomer";
}
greetingElement.innerHTML = greetingMessage;
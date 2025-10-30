chrome.alarms.onAlarm.addListener(() => {
    chrome.notifications.create({
       type: "basic",
       iconUrl: "images/logo.png",
       title: "Time to water your plants!",
       message: "Don't forget to water your plants and make sure they're receiving the proper nutrients to continue growing!",
       buttons: [{title: "I will!"}]
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "showNotification"){
        chrome.notifications.create(request.options);
    }
});
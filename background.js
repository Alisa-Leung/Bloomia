chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("waterPlants", {
        periodInMinutes: 1440,
        when: Date.now() + 1000;
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "waterPlants"){
        chrome.notifications.create({
            type: "basic",
            iconUrl: "images/logo.png",
            title: "Time to water your plants!",
            message: "Don't forget to water your plants and make sure they're receiving the proper nutrients to continue growing!",
            buttons: [{title: "I will!"}],
            priority: 2;
        });
    }
});
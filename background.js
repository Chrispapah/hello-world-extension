console.log("NP worker loaded");

chrome.runtime.onMessage.addlistener (m=>{if (m.type == "RUN_NOW") console.log("RUN_NOW received");});

chrome.alarms.onAlarm.addlistener (a=> console.log("alarm",a.name));

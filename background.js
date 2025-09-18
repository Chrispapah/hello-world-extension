console.log("NP worker loaded");

chrome.runtime.onMessage.addListener (m=>{if (m.type == "RUN_NOW") console.log("RUN_NOW received");});

chrome.alarms.onAlarm.addListener (a=> console.log("alarm",a.name));

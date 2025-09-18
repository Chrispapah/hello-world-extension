async function setAlarm(minutes){
  await chrome.alarms.clear("np-scan");
  if (minutes && minutes >= 5) {
    chrome.alarms.create("np-scan", { periodInMinutes: minutes });
  }
}

// init alarm on install/update
chrome.runtime.onInstalled.addListener(async () => {
  const { interval = 15 } = await chrome.storage.sync.get("interval");
  setAlarm(interval);
});

// receive messages from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_ALARM") {
    return setAlarm(msg.payload.intervalMinutes);
  }
  if (msg.type === "RUN_NOW") {
    return triggerRun();
  }
});

// fire on schedule
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "np-scan") triggerRun();
});

async function triggerRun(){
  try {
    const { count = 25 } = await chrome.storage.sync.get("count");
    await fetch("https://api.neuralpath.io/n8n/run-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emailsPerRun: count })
    });
  } catch (e) {
    // optional: chrome.notifications API to alert the user
    console.warn("Run trigger failed:", e);
  }
}

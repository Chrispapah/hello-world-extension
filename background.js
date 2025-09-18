const RUN_URL = "https://cpapa.app.n8n.cloud/webhook/80ea3982-204e-4410-88f0-20947f55ae5e";

async function setAlarm(minutes) {
  await chrome.alarms.clear("np-scan");
  if (minutes && minutes >= 5) chrome.alarms.create("np-scan", { periodInMinutes: minutes });
}

// init alarm on install/update
chrome.runtime.onInstalled.addListener(async () => {
  const { interval = 15 } = await chrome.storage.sync.get("interval");
  setAlarm(interval);
});

// messages from popup
chrome.runtime.onMessage.addListener((m) => {
  if (m.type === "SET_ALARM") return setAlarm(m.payload.intervalMinutes);
  if (m.type === "RUN_NOW")   return triggerRun();
});

// scheduled run
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "np-scan") triggerRun();
});

async function triggerRun() {
  try {
    const { count = 25 } = await chrome.storage.sync.get("count");
    const r = await fetch(RUN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailsPerRun: count })
    });
    console.log("[NP] POST", RUN_URL, "->", r.status, r.statusText);
    if (!r

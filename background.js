const RUN_URL = "https://cpapa.app.n8n.cloud/webhook/80ea3982-204e-4410-88f0-20947f55ae5e";

async function setAlarm(minutes) {
  await chrome.alarms.clear("np-scan");
  if (minutes && minutes >= 5) chrome.alarms.create("np-scan", { periodInMinutes: minutes });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { interval = 15 } = await chrome.storage.sync.get("interval");
  setAlarm(interval);
});

// messages from popup
chrome.runtime.onMessage.addListener((m) => {
  if (m.type === "SET_ALARM") return setAlarm(m.payload.intervalMinutes);
  if (m.type === "RUN_NOW")   return triggerRun("runNow");
});

// scheduled run
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "np-scan") triggerRun("alarm");
});

async function triggerRun(action = "runNow") {
  try {
    const { count = 25, interval = 15 } = await chrome.storage.sync.get(["count", "interval"]);

    const body = {
      emailsPerRun: count,
      intervalMinutes: interval,
      action,
      triggeredAt: new Date().toISOString()
    };

    const r = await fetch(RUN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    console.log("[NP] POST", RUN_URL, "->", r.status, r.statusText);
    if (!r.ok) console.log("[NP] body:", await r.text());
  } catch (e) {
    console.warn("Run trigger failed:", e);
  }
}

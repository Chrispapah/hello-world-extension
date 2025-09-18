const $ = id => document.getElementById(id);

(async function init () {
  const { interval = 15, count = 25 } = await chrome.storage.sync.get(["interval", "count"]);
  $("interval").value = interval;
  $("count").value = count;
})();

$("save").onclick = async () => {
  const payload = {
    intervalMinutes: Number($("interval").value),
    emailsPerRun: Number($("count").value),
  };

  // persist locally
  await chrome.storage.sync.set({ interval: payload.intervalMinutes, count: payload.emailsPerRun });

  // ask background to (re)create the alarm
  chrome.runtime.sendMessage({ type: "SET_ALARM", payload });

  // send to your backend (forward to n8n)
  try {
    const r = await fetch(
      "https://cpapa.app.n8n.cloud/webhook/80ea3982-204e-4410-88f0-20947f55ae5e",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(

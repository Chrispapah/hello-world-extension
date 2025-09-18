const $ = id => document.getElementById(id);

(async function init(){
  const { interval = 15, count = 25 } = await chrome.storage.sync.get(["interval","count"]);
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

  // send to your backend (server should forward to n8n Webhook / Data Store)
  // add auth (cookies/jwt) if your site requires it
  fetch("https://api.neuralpath.io/n8n/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  }).catch(() => {});

  window.close();
};

$("runNow").onclick = () => chrome.runtime.sendMessage({ type: "RUN_NOW" });

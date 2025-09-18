const $ = (id) => document.getElementById(id);

(async function init () {
  const { interval = 15, count = 25 } = await chrome.storage.sync.get(["interval", "count"]);
  $("interval").value = interval;
  $("count").value = count;
})();

$("save").onclick = async () => {
  const payload = {
    intervalMinutes: Number($("interval").value),
    emailsPerRun: Number($("count").value),
    action: "save",
    triggeredAt: new Date().toISOString()
  };

  // persist locally
  await chrome.storage.sync.set({
    interval: payload.intervalMinutes,
    count: payload.emailsPerRun
  });

  // (re)create alarm
  chrome.runtime.sendMessage({ type: "SET_ALARM", payload });

  // send to your webhook (or backend -> n8n)
  try {
    const r = await fetch(
      "https://cpapa.app.n8n.cloud/webhook/80ea3982-204e-4410-88f0-20947f55ae5e",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    console.log("onboard/save status:", r.status);
  } catch (e) {
    console.warn("onboard/save failed:", e);
  }

  window.close();
};

$("runNow").onclick = () => chrome.runtime.sendMessage({ type: "RUN_NOW" });

document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  const countdown = document.getElementById("countdown");

  const endTime = new Date(config.regStart);

  function count() {
    const now = Date.now();
    if (endTime.valueOf() <= now) {
      const container = document.getElementById("countdown-container");
      container.parentNode.removeChild(container);
    } else {
      const useRelative = endTime.valueOf() - now < 3600000;

      let time = endTime.toLocaleDateString("default", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      if (useRelative) {
        time = formatRemaining(endTime.valueOf() - now);
      }

      countdown.textContent = time;
      requestAnimationFrame(count);
    }
  }

  requestAnimationFrame(count);
});

function formatRemainingTime(milliseconds) {
  var minutes = Math.floor(milliseconds / 60 / 1000);
  var seconds = Math.floor((milliseconds / 1000) % 60);
  var ms = Math.floor((milliseconds % 1000) / 10);
  if (!minutes) {
    return leftPad(seconds) + ":" + leftPad(ms);
  } else {
    return leftPad(minutes) + ":" + leftPad(seconds);
  }
}

function leftPad(number) {
  return number.toString().length < 2 ? "0" + number : number;
}

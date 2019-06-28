document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  const countdown = document.getElementById("countdown");
  const longText = document.getElementById("countdown-text-long");
  const shortText = document.getElementById("countdown-text-short");

  const endTime = new Date(config.regStart);

  if (endTime.valueOf() <= Date.now()) {
    const container = document.getElementById("countdown-container");
    container.parentNode.removeChild(container);

    activateButton();

    return;
  }

  function count() {
    const now = Date.now();
    if (endTime.valueOf() <= now) {
      countdown.textContent = "00:00";
      activateButton();
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
        longText.classList.add("hidden");
        shortText.classList.remove("hidden");
      } else {
        longText.classList.remove("hidden");
        shortText.classList.add("hidden");
      }

      countdown.textContent = time;
      requestAnimationFrame(count);
    }
  }

  requestAnimationFrame(count);
});

function formatRemaining(milliseconds) {
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

function activateButton() {
  const elements = document.querySelectorAll(".activate-after-countdown");

  for (let i = 0; i < elements.length; i++) {
    elements[i].removeAttribute("disabled");
  }
}

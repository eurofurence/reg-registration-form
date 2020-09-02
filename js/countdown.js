document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  // this is used by our automated end-to-end tests to control the "current time" in a convenient fashion
  //
  // NOTE: the backend checks the current time independently when submitting registrations, so this is perfectly safe
  //
  if (window.location.search.indexOf('currentTime') !== -1) {
    config.timeServer += window.location.search;

    const elements = document.querySelectorAll(".add-current-time-mock-if-set");
    for (let i = 0; i < elements.length; i++) {
      elements[i].href += window.location.search;
    }
  }

  deactivateButton();

  loadTime(config);
});

async function loadTime(config) {
  const countdown = document.getElementById("countdown");
  const countdownBerlinTz = document.getElementById("countdown-berlin-tz");
  const longText = document.getElementById("countdown-text-long");
  const shortText = document.getElementById("countdown-text-short");
  const error = document.getElementById("countdown-error");

  let timeResponse, time;

  try {
    timeResponse = await fetch(config.timeServer);
    time = await timeResponse.json();

    // only show the 'get started' button, if the timeserver is ok (and thus javascript is working)
    const elements = document.querySelectorAll(".unhide-if-timeserver-ok");
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("hidden");
    }
  } catch (e) {
    longText.classList.add("hidden");
    shortText.classList.add("hidden");
    error.classList.remove("hidden");
    return setTimeout(() => loadTime(config), 5000);
  }

  error.classList.add("hidden");

  const endTime = Date.now() + time.countdown * 1000;

  if (endTime <= Date.now()) {
    const container = document.getElementById("countdown-container");
    container.parentNode.removeChild(container);

    activateButton();

    return;
  }

  function count() {
    const now = Date.now();
    if (endTime <= now) {
      countdown.textContent = "00:00";
      activateButton();
    } else {
      const useRelative = endTime - now < 3600000;
      const targetTime = new Date(time.targetTime)
      const timeFormat = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }

      let timeString = targetTime.toLocaleDateString("en-GB", timeFormat);
      const berlinTimeString = targetTime.toLocaleDateString("en-GB", { ...timeFormat, timeZone: 'Europe/Berlin', timeZoneName: 'short' });

      if (useRelative) {
        timeString = formatRemaining(endTime - now);
        countdownBerlinTz.classList.add("hidden");
        longText.classList.add("hidden");
        shortText.classList.remove("hidden");
      } else {
        countdownBerlinTz.textContent = `(${berlinTimeString})`;
        countdownBerlinTz.classList.remove("hidden");
        longText.classList.remove("hidden");
        shortText.classList.add("hidden");
      }

      countdown.textContent = timeString;

      setTimeout(function() {
        requestAnimationFrame(count);
      }, 100);
    }
  }

  requestAnimationFrame(count);
}

function formatRemaining(milliseconds) {
  const minutes = Math.floor(milliseconds / 60 / 1000);
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const ms = Math.floor((milliseconds % 1000) / 10);
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

function deactivateButton() {
  const elements = document.querySelectorAll(".activate-after-countdown");

  for (let i = 0; i < elements.length; i++) {
    elements[i].setAttribute("disabled", true);
  }
}

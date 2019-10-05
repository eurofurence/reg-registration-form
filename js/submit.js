document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  const langCode = navigator.userLanguage || navigator.language;
  let lang = langCode.substr(0, 2);
  if (!Object.keys(config.availableLanguages).includes(lang)) {
    lang = config.defaultLanguage;
  }

  restoreForm();

  setupCountries(config.availableCountries, lang);
  setupTShirts(config.tShirt, lang);
  setupPartner(config.partnerVisible);
  setupOptions(config.flags, config.options, lang);
  setupPackages(config.packages, lang);
  setupBirthday();
  setupGender();

  setupSubmitButton(config.apiEndpoint);
});

function setupCountries(countries, lang) {
  const elements = document.querySelectorAll(
    '[data-field="country"],[data-field="country_badge"]'
  );

  for (let i = 0; i < elements.length; i++) {
    elements[i].textContent = countries[elements[i].textContent][lang];
  }
}

function setupBirthday() {
  const element = document.querySelector('[data-field="birthday"]');
  element.textContent = new Date(element.textContent).toLocaleDateString();
}

function setupTShirts(tshirts, lang) {
  const element = document.querySelector('[data-field="tshirt_size"]');
  element.textContent = tshirts.find(
    ({ code }) => code === element.textContent
  )[lang];
}

function setupPartner(visible) {
  if (!visible) {
    const element = document.getElementById("partner");
    element.parentNode.removeChild(element);
  }
}

function setupOptions(flags, options, lang) {
  let data = localStorage.getItem("regFormData");
  if (data) {
    data = JSON.parse(data);
    const container = document.getElementById("options");

    flags.forEach(flag => {
      if (data["flags:" + flag.code]) {
        container.innerHTML += `<span>${flag[lang].label}</span>`;
      }
    });
    options.forEach(option => {
      if (data["options:" + option.code]) {
        container.innerHTML += `<span>${option[lang].label}</span>`;
      }
    });
  }
}

function setupGender() {
  let data = localStorage.getItem("regFormData");
  if (data) {
    data = JSON.parse(data);
    const gender = data.gender;

    const entries = document.querySelectorAll(".gender");

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].getAttribute("data-key") !== gender) {
        entries[i].parentNode.removeChild(entries[i]);
      }
    }
  }
}

function setupPackages(packages, lang) {
  let data = localStorage.getItem("regFormData");
  if (data) {
    data = JSON.parse(data);
    const container = document.getElementById("packages");

    packages.forEach(package => {
      if (data["packages:" + package.code]) {
        container.innerHTML += `<span>${package[lang].label}</span>`;
      }
    });
  }
}

function restoreForm() {
  let data = localStorage.getItem("regFormData");
  if (data) {
    data = JSON.parse(data);
    Object.entries(data).forEach(([key, value]) => {
      const element = document.querySelector(`[data-field="${key}"]`);
      if (element) {
        if (typeof value === "boolean") {
          document.querySelector(`[data-field="${key}"]`).checked = value;
        } else {
          document.querySelector(`[data-field="${key}"]`).textContent = value;
        }
      }
    });
  }
}

function setupSubmitButton(endpoint) {
  const btn = document.querySelector('button[data-content="SUBMIT"]');

  const payload = JSON.stringify(getPayload());

  btn.addEventListener("click", async () => {
    let timeResponse, time;

    try {
      timeResponse = await fetch(config.timeServer);
      time = await timeResponse.json();
    } catch (e) {
      return showError("TIMESERVER");
    }

    if (!checkboxIsChecked()) {
      return showError("CHECKBOX");
    }
    if (time.countdown > 0) {
      return showError("COUNTDOWN");
    }
    if (!formValid()) {
      return showError("INVALID");
    }
    btn.setAttribute("disabled", true);
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        body: payload,
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.text();

      if (response.status < 200 || response.status >= 300) {
        showError(data || "UNKNOWN");
        btn.removeAttribute("disabled");
      } else {
        showSuccess(data);
      }
    } catch (e) {
      showError(e);
      btn.removeAttribute("disabled");
    }
  });
}

function checkboxIsChecked() {
  return document.querySelector(".confirm_checkbox input").checked;
}

function showSuccess(data) {
  const element = document.querySelector("#submit-response");

  element.classList.remove("error");
  element.textContent = translate("SUCCESS") + data;
}

function showError(data) {
  const element = document.querySelector("#submit-response");

  element.classList.add("error");
  element.textContent = translate("ERROR_" + data);
}

function getPayload() {
  let data = localStorage.getItem("regFormData");
  if (data) {
    data = JSON.parse(data);

    delete data.email_repeat;
    aggregate("flags", data);
    aggregate("packages", data);
    aggregate("options", data);

    return data;
  } else {
    return {};
  }
}

function aggregate(type, data) {
  data[type] = Object.keys(data)
    .filter(key => key.split(":")[0] === type && data[key])
    .map(key => key.split(":")[1])
    .join(",");

  Object.keys(data).forEach(key => {
    if (key.indexOf(":") !== -1 && key.split(":")[0] === type) {
      delete data[key];
    }
  });
}

function formValid() {
  const payload = getPayload();
  const keys = Object.keys(payload);

  for (let i = 0; i < keys.length; i++) {
    if (!isValid(keys[i], payload[keys[i]])) {
      return false;
    }
  }

  return true;
}

function isValid(element, value) {
  switch (element) {
    case "nickname":
      return (
        value.length >= 2 &&
        value.length <= 80 &&
        /^([A-Za-z]+[^A-Za-z]?[A-Za-z]+[^A-Za-z]?[A-Za-z]*|[^A-Za-z]?[A-Za-z]+[^A-Za-z]?[A-Za-z]+|[^A-Za-z]?[A-Za-z][A-Za-z]+[^A-Za-z]?|[^A-Za-z]{1,2}[A-Za-z][A-Za-z]+|[A-Za-z]+[^A-Za-z]{1,2}[A-Za-z]+|[A-Za-z][A-Za-z]+[^A-Za-z]{1,2})$/.test(
          value
        )
      );
    case "first_name":
    case "last_name":
    case "city":
      return value.length >= 1 && value.length <= 80;
    case "street":
      return value.length >= 1 && value.length <= 120;
    case "zip":
      return value.length >= 1 && value.length <= 20;
    case "state":
      return value.length >= 0 && value.length <= 80;
    case "email":
      return value.length >= 1 && value.length <= 200;
    case "email_repeat":
      return value === document.querySelector('[data-field="email"]').value;
    case "phone":
      return value.length >= 1 && value.length <= 32;
    case "birthday":
      return /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/.test(value);
  }

  return true;
}

document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  const langCode = navigator.userLanguage || navigator.language;
  let lang = langCode.substr(0, 2);
  if (!Object.keys(config.availableLanguages).includes(lang)) {
    lang = config.defaultLanguage;
  }

  setupCountries(config.availableCountries, lang);
  setupTShirts(config.tShirt, lang);
  setupPartner(config.partnerVisible);
  setupOptions("flags", config.flags, lang);
  setupOptions("options", config.options, lang);
  setupPackages(config.tiers, config.packages, lang);

  restoreForm();

  hideUnchecked();

  setupSubmitButton(config.regStart, config.apiEndpoint);
});

function setupCountries(countries, lang) {
  const elements = document.querySelectorAll(
    '[data-field="country"],[data-field="country_badge"]'
  );

  const options = [];
  Object.keys(countries).forEach(key => {
    options.push({ key, value: countries[key][lang] });
  });
  options.sort((a, b) => {
    return a.value > b.value ? 1 : -1;
  });

  for (let i = 0; i < elements.length; i++) {
    options.forEach(({ key, value }) => {
      const option = document.createElement("option");
      option.setAttribute("value", key);
      option.textContent = value;

      elements[i].appendChild(option);
    });
  }
}

function setupTShirts(tshirts, lang) {
  const element = document.querySelector('[data-field="tshirt_size"]');
  tshirts.forEach(el => {
    const option = document.createElement("option");
    option.setAttribute("value", el.code);
    option.textContent = el[lang];

    element.appendChild(option);
  });
}

function setupPartner(visible) {
  if (!visible) {
    const element = document.getElementById("partner");
    element.parentNode.removeChild(element);
  }
}

function setupOptions(selector, options, lang) {
  const container = document.getElementById(selector);
  options.forEach(option => {
    const entry = document.createElement("div");
    entry.innerHTML = `<label>
    <input disabled type="checkbox" data-field="${selector}:${
      option.code
    }"></input>
      <span>${option[lang].label}</span>
    </label>
    `;

    container.appendChild(entry);
  });
}

function setupPackages(tiers, packages, lang) {
  const container = document.getElementById("packages");
  const table = document.createElement("table");

  // body
  const body = document.createElement("tbody");
  body.innerHTML = packages
    .map(
      package => `<tr>
    <td>
      <label>
      <input disabled type="checkbox" data-field="packages:${
        package.code
      }"></input>
      <span>${package[lang].label}</span>
      </label>
    </td>
  </tr>`
    )
    .join("");
  table.appendChild(body);

  container.appendChild(table);
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
          document.querySelector(`[data-field="${key}"]`).value = value;
        }
      }
    });
  }
}

function hideUnchecked() {
  const elements = document.querySelectorAll('fieldset input[type="checkbox"]');

  for (let i = 0; i < elements.length; i++) {
    if (!elements[i].checked) {
      const container = elements[i].parentNode.parentNode;
      container.parentNode.removeChild(container);
    }
  }
}

function setupSubmitButton(startDate, endpoint) {
  const btn = document.querySelector('button[data-content="SUBMIT"]');

  btn.addEventListener("click", async () => {
    if (!checkboxIsChecked()) {
      return showError("CHECKBOX");
    }
    if (!countdownIsReady(startDate)) {
      return showError("COUNTDOWN");
    }
    if (!formValid()) {
      return showError("INVALID");
    }
    btn.setAttribute("disabled", true);
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(getPayload()),
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.text();

      if (response.status !== 200) {
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

function countdownIsReady(date) {
  return new Date(date).valueOf() < Date.now();
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
  const elements = document.querySelectorAll("[data-field]");
  for (var i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (!isValid(element.getAttribute("data-field"), element.value)) {
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

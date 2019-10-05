document.addEventListener("click", evt => {
  const target = evt.target;

  if (target.classList.contains("disabled")) {
    evt.preventDefault();
  }

  if (target.classList.contains("help-toggle-button")) {
    if (target.classList.contains("table-help")) {
      target.parentNode.parentNode.nextElementSibling.classList.toggle(
        "expanded"
      );
    } else {
      target.parentNode.classList.toggle("expanded");
    }
  }
});

document.addEventListener("input", evt => {
  if (evt.target.classList.contains("invalid")) {
    if (isValid(evt.target.getAttribute("data-field"), evt.target.value)) {
      evt.target.classList.remove("invalid");
    }
  }
  storeForm();
});

document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  document.addEventListener("change", evt => {
    const field = evt.target.getAttribute("data-field");
    if (field) {
      if (isValid(field, evt.target.value)) {
        evt.target.classList.remove("invalid");
      } else {
        evt.target.classList.add("invalid");
      }

      if (field === "country") {
        document.querySelector('[data-field="country_badge"]').value =
          evt.target.value;
      }

      const subfields = field.split(":");
      if (subfields[0] === "packages") {
        const value = subfields[1];
        if (evt.target.checked) {
          config.packageExclusivity.forEach(exclusives => {
            if (exclusives.includes(value)) {
              exclusives.forEach(excludedPackage => {
                if (excludedPackage !== value) {
                  document.querySelector(
                    '[data-field="packages:' + excludedPackage + '"]'
                  ).checked = false;
                }
              });
            }
          });
        }
      }
      storeForm();
    }
  });

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
  setupBirthday(config.birthdayLimits);

  restoreForm();
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
    <input type="checkbox" data-field="${selector}:${option.code}"${
      option.default ? " checked" : ""
    }></input>
      <span>${option[lang].label}</span>
    </label>
    <button class="help-toggle-button" tabindex="-1">?</button>
    <p class="helptext">${option[lang].description}</p>
    `;

    container.appendChild(entry);
  });
}

function setupPackages(tiers, packages, lang) {
  const container = document.getElementById("packages");
  const table = document.createElement("table");

  // head
  const head = document.createElement("thead");
  head.innerHTML = `<tr>
    <th></th>
    ${tiers
      .map(
        tier => `<th>
        <b>${tier[lang].label}</b>
        <i>${tier[lang].description}</i>
      </th>`
      )
      .join("")}
  <th></th></tr>`;
  table.appendChild(head);

  // body
  const body = document.createElement("tbody");
  body.innerHTML = packages
    .map(
      package => `<tr>
    <td>
      <label>
      <input type="checkbox" data-field="packages:${package.code}"${
        package.default ? " checked" : ""
      }></input>
      <span>${package[lang].label}</span>
      </label>
    </td>
    ${package.price.map(price => `<td>${price}</td>`).join("")}
    <td><button class="help-toggle-button table-help" tabindex="-1">?</button></td>
    </tr>
    <div class="helptext-container"><div class="helptext">${
      package[lang].description
    }</div></div>`
    )
    .join("");
  table.appendChild(body);

  container.appendChild(table);
}

function setupBirthday(limits) {
  const element = document.querySelector('[data-field="birthday"]');
  element.setAttribute("min", limits.oldest);
  element.setAttribute("max", limits.youngest);
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
    case "country":
    case "country_badge":
      return value !== "none";
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

function storeForm() {
  const elements = document.querySelectorAll("[data-field]");
  const data = {};
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].getAttribute("type") === "checkbox") {
      data[elements[i].getAttribute("data-field")] = elements[i].checked;
    } else {
      data[elements[i].getAttribute("data-field")] = elements[i].value;
    }
  }
  localStorage.setItem("regFormData", JSON.stringify(data));

  updateSubmitButtonState();
}

function restoreForm() {
  let data = localStorage.getItem("regFormData");
  if (data) {
    data = JSON.parse(data);
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        document.querySelector(`[data-field="${key}"]`).checked = value;
      } else {
        document.querySelector(`[data-field="${key}"]`).value = value;
      }
    });
  }

  updateSubmitButtonState();
}

function updateSubmitButtonState() {
  const elements = document.querySelectorAll("[data-field]");
  for (var i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (!isValid(element.getAttribute("data-field"), element.value)) {
      return document
        .querySelector('[data-content="GOTO_SUMMARY"]')
        .classList.add("disabled");
    }
  }
  document
    .querySelector('[data-content="GOTO_SUMMARY"]')
    .classList.remove("disabled");
}

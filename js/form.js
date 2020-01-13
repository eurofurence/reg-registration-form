document.addEventListener("click", evt => {
  const target = evt.target;

  if (target.classList.contains("disabled")) {
    evt.preventDefault();
  }

  if (target.classList.contains("help-toggle-button")) {
    if (target.classList.contains("table-help")) {
      target.parentNode.parentNode.nextElementSibling.children[1].children[0].classList.toggle(
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

  document.addEventListener("focusout", evt => {
    const field = evt.target.getAttribute("data-field");
    if (field) {
      revalidateField(field, evt.target);
    }
  });

  document.addEventListener("change", evt => {
    const field = evt.target.getAttribute("data-field");
    if (field) {
      revalidateField(field, evt.target);

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
        } else {
          // re-enable any de-selected packages that are mandatory
          config.packages.forEach(pkg => {
            if (pkg.required) {
              var chkbox = document.querySelector(
                  '[data-field="packages:' + pkg.code + '"]'
              );
              chkbox.checked = true;
              chkbox.disabled = true;
            }
          })
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
  setupTelegram(config.telegramVisible);
  setupOptions("flags", config.flags, lang);
  setupOptions("options", config.options, lang);
  setupPackages(config.tiers, config.packages, lang);
  setupBirthday(config.birthdayLimits);

  const previousReg = localStorage.getItem("regSuccess");
  if (previousReg) {
    localStorage.removeItem("regFormData");
    localStorage.removeItem("regSuccess");
  } else {
    restoreForm();
  }
});

function revalidateField(fieldCode, fieldElement) {
  if (isValid(fieldCode, fieldElement.value)) {
    fieldElement.classList.remove("invalid");
  } else {
    fieldElement.classList.add("invalid");
  }
  if (fieldCode === "email") {
    // when changing email, also validate email_repeat
    let emailRepeatElement = document.querySelector(`[data-field="email_repeat"]`);
    if (isValid("email_repeat", emailRepeatElement.value)) {
      emailRepeatElement.classList.remove("invalid");
    } else {
      emailRepeatElement.classList.add("invalid");
    }
  }
}

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

function setupTelegram(visible) {
  if (!visible) {
    const element = document.getElementById("telegram");
    element.parentNode.removeChild(element);
  }
}

function setupOptions(selector, options, lang) {
  const container = document.getElementById(selector);
  options.forEach(option => {
    const entry = document.createElement("div");
    entry.innerHTML = `<label>
    <input type="checkbox" id="${selector}-${option.code}-field" data-field="${selector}:${option.code}" ${
      option.default ? " checked" : ""
    }/>
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
      pack => `<tr>
    <td>
      <label>
      <input type="checkbox" id="packages-${pack.code}-field" data-field="packages:${pack.code}" ${
        pack.default ? " checked" : ""
      }/>
      <span>${pack[lang].label}</span>
      </label>
    </td>
    ${pack.price.map(price => `<td>${price}</td>`).join("")}
    <td><button class="help-toggle-button table-help" tabindex="-1">?</button></td>
    </tr>
    <tr>
      <td></td>
      <td colspan="3"><div class="helptext-container"><div class="helptext">${
          pack[lang].description
        }</div></div></td>
      <td></td>
    </tr>`
    )
    .join("");
  table.appendChild(body);

  container.appendChild(table);

  // select any packages that are mandatory and make checkboxes read only
  packages.forEach(pkg => {
    if (pkg.required) {
      var chkbox = document.querySelector(
          '[data-field="packages:' + pkg.code + '"]'
      );
      chkbox.checked = true;
      chkbox.disabled = true;
    }
  })

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
        value.length >= 1 &&
        value.length <= 80 &&
        /^([A-Za-z0-9 ]*[A-Za-z0-9][A-Za-z0-9 ]*[^A-Za-z0-9 ]?[A-Za-z0-9 ]*[^A-Za-z0-9 ]?[A-Za-z0-9 ]*|[A-Za-z0-9 ]*[^A-Za-z0-9 ]?[A-Za-z0-9 ]*[A-Za-z0-9][A-Za-z0-9 ]*[^A-Za-z0-9 ]?[A-Za-z0-9 ]*|[A-Za-z0-9 ]*[^A-Za-z0-9 ]?[A-Za-z0-9 ]*[^A-Za-z0-9 ]?[A-Za-z0-9 ]*[A-Za-z0-9][A-Za-z0-9 ]*)$/.test(
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
      return value.length >= 1 && value.length <= 200 && /^[^@\s]+@[^@\s]+$/.test(value);
    case "email_repeat":
      return value.length >= 1 && value.length <= 200 && value === document.querySelector('[data-field="email"]').value;
    case "phone":
      return value.length >= 1 && value.length <= 32;
    case "birthday":
      return /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/.test(value);
    case "telegram":
      return !value.length || value.charAt(0) === "@";
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
      let fieldElement = document.querySelector(`[data-field="${key}"]`);
      if (typeof value === "boolean") {
        fieldElement.checked = value;
      } else {
        fieldElement.value = value;
        revalidateField(key, fieldElement);
      }
    });
  }

  updateSubmitButtonState();
}

function updateSubmitButtonState() {
  const elements = document.querySelectorAll("[data-field]");
  for (let i = 0; i < elements.length; i++) {
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

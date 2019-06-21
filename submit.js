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
    <input disabled type="checkbox" data-field="${selector}:${option.code}"${
      option.default ? " checked" : ""
    }></input>
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
      <input disabled type="checkbox" data-field="package:${package.code}"${
        package.default ? " checked" : ""
      }></input>
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

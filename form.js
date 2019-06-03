document.addEventListener("click", evt => {
  const target = evt.target;
  if (target.classList.contains("help-toggle-button")) {
    target.parentNode.classList.toggle("expanded");
  }
});

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
      <span>${option[lang].label}</span>
      <input type="checkbox" data-field="${selector}:${option.code}"${
      option.default ? " checked" : ""
    }></input>
    </label>
    <button class="help-toggle-button">?</button>
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
  </tr>`;
  table.appendChild(head);

  // body
  const body = document.createElement("tbody");
  body.innerHTML = packages
    .map(
      package => `<tr>
    <td>
      <label>
      <input type="checkbox" data-field="package:${package.code}"${
        package.default ? " checked" : ""
      }></input>
      <span>${package[lang].label}</span>
      </label>
      <button class="help-toggle-button">?</button>
      <p class="helptext">${package[lang].description}</p>
    </td>
    ${package.price.map(price => `<td>${price}</td>`).join("")}
  </tr>`
    )
    .join("");
  table.appendChild(body);

  container.appendChild(table);
}

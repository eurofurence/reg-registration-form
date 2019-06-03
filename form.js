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
  const lang = langCode.substr(0, 2);

  const elements = document.querySelectorAll(
    '[data-field="country"],[data-field="country_badge"]'
  );

  const options = [];
  Object.keys(config.availableCountries).forEach(key => {
    options.push({ key, value: config.availableCountries[key][lang] });
  });
  console.log(JSON.stringify(options));
  options.sort((a, b) => {
    return (a.value > b.value) * 2 - 1;
  });
  console.log(JSON.stringify(options));

  for (let i = 0; i < elements.length; i++) {
    options.forEach(({ key, value }) => {
      const option = document.createElement("option");
      option.setAttribute("value", key);
      option.textContent = value;

      elements[i].appendChild(option);
    });
  }
});

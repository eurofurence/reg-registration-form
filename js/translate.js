let texts;

document.addEventListener("DOMContentLoaded", async () => {
  const configResponse = await fetch("./config.json");
  const config = await configResponse.json();

  const langCode = navigator.userLanguage || navigator.language;
  let lang = langCode.substr(0, 2);
  if (!Object.keys(config.availableLanguages).includes(lang)) {
    lang = config.defaultLanguage;
  }

  const textsResponse = await fetch("lang/" + lang + ".json");
  texts = await textsResponse.json();

  await resolveSnippets();

  const elements = document.querySelectorAll("[data-content]");

  for (let i = 0; i < elements.length; i++) {
    elements[i].innerHTML = texts[elements[i].getAttribute("data-content")];
  }
});

async function resolveSnippets() {
  const elements = document.querySelectorAll("[data-snippet]");

  for (let i = 0; i < elements.length; i++) {
    const snippetName = elements[i].getAttribute("data-snippet");

    const snippetResponse = await fetch("snippets/" + snippetName + ".html");
    
    elements[i].innerHTML = await snippetResponse.text();
  }
}

function translate(KEY) {
  return texts[KEY];
}

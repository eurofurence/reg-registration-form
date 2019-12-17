# Eurofurence Registration App

This is a statically hostable app for registering for Eurofurence. It allows the user to enter required personal details and issue a request to the registration server.

## Setup

Since this is a static webpage, you can just copy and paste the contents of this directory to any webserver. You might want to configure certain files to your needs. Here is how to do the most common tasks:

- [Change Available Languages](#change-available-languages)
- [Adjust Registration Options](#adjust-registration-options)
- [Adjust Text and Snippets](#adjust-text-and-snippets)

### Change Available Languages

This app has multi-language support and always displays the users preferred language if available (determined by the users browser setting). If the users preferred language is not available, the `defaultLanguage` as specified in the `config.json` is used.

To add a new language, you have to perform multiple steps:

1. Add it to the `availableLanguages` object in the `config.json`.
2. Add a translation for all the following configuration fields:

- `availableCountries`
- `flags`
- `tiers`
- `packages`
- `options`
- `tShirt`

3. Create a copy of the `en.json` in the `lang` folder and translate every key in the contained JSON object

### Adjust Registration Options

Check out the `config.json` file to see what can be configured regarding registration options.

### Adjust Text and Snippets

All the text displayed on the page is contained in the translation file to allow for easy translation into multiple languages. You can use HTML markup in the strings for some basic inline styling, like making certain text passages bold or underlined.

For more complex changes in the markup, you can have a look at the snippets directory. There you can write HTML markup. To include texts from the translation files, you can set the `data-content` attribute on an element to fill it with the string specified in the translation. Keep in mind that `data-content` should only be used on leaf nodes of the DOM tree as any content will be overwritten by the translation.

If you need to change even more, you can have a look at the html files in the root directory. **Be aware that you can break the app if you change things there!** You can for example add a new snippet entry point by using the `data-snippet` attribute.

## Convert for browser compatibility

We use [babel](https://babeljs.io/rep) to transpile our javascript code to work with older browsers such as IE11. Not all features
will work, e.g. on IE11 the form fields are lost if you navigate back, but it is at least possible to make a new registration.
 
To transpile the code, run ```npm i && ./babel.sh``` in the root directory of the repository.

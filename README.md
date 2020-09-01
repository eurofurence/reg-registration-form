# Eurofurence Registration App

This is a statically hostable app for registering for Eurofurence. It allows the user to enter required personal details and issue a request to the registration server.

## Development

You can deploy and run all required components on your local system.

### Backend

The static web application needs the attendee service running as a backend. It comes with a built in in-memory database
and can be configured to send CORS headers allowing you to access it locally without having to install a full web server.

* install [golang](https://golang.org/)
    * please use a current version, run `go version` to see what version you have
    * the minimum required version is specified in [go.mod](https://github.com/eurofurence/reg-attendee-service/blob/master/go.mod)
* clone [eurofurence/reg-attendee-service](https://github.com/eurofurence/reg-attendee-service.git) to a directory 
  outside your GOPATH.
* open a shell inside this directory
* copy `docs/config-template.yaml` to `./config.yaml`
* edit `config.yaml`
    * change `security.disable_cors` from `false` to `true` to enable sending CORS allow headers
    * comment out the line setting `security.fixed.reg` by placing a `#` in front of it, that is,
      ```
        # reg: 'optionally_put_secure_random_string_here_for_securing_initial_reg'
      ```
    * the only other setting you should need to touch is the go-live time, set in `start_iso_datetime`. This is 
      the time at which public registration becomes available. Use this setting to test the countdown feature.
      If you use the automated UI tests, this setting will need to match up with the value used in the tests.
* compile the backend using `go build main.go`
* start the backend using `./main -config config.yaml`

### This Frontend

Once [node.js](https://nodejs.org/en/download/) (and thus npm) is installed and in your path (please use a current version),
you should be able to use `npm install` to obtain the dependencies and then `./babel.sh` to transpile the javascript code to be compatible
with older browsers.

Now you need some web server to serve the static files in this directory and below.

If you are using JetBrains WebStorm, just use the built-in web server, open index.html and click open in browser.

### Automated UI Tests

With node.js already installed, here is how you can run the automated UI tests.

* clone [eurofurence/reg-registration-form-uitest.git](https://github.com/eurofurence/reg-registration-form-uitest.git)
* run `npm install`, this will install testcafe in the local directory
* you may need to edit the URL to your local installation and the go-live time at the top of `src/main.js`. There
  are some comments helping you with converting the time zones.
* run `node node_modules/testcafe/bin/testcafe.js firefox src/main.js` on the command line to execute the full test suite.

Note: the README.md contains instructions on how to run the tests using JetBrains WebStorm.

## Configuration

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

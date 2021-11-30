function hasNoLeadingOrTrailingWhitespace(value) {
  return value.trim() === value
}

function isSpecialCharacter(character) {
  return /[^a-zA-Z0-9\u00c0-\u017e\u0400-\u04FF ]/.test(character)
}

function isSpace(character) {
  return character === " "
}

function nicknameWithinCharLimits(value) {
  return value.length >= 1 && value.length <= 80
}

function isValidNickname(value) {
  let numberSpecialCharacters = 0
  let numberRegularCharacters = 0

  for (let i = 0; i < value.length; i++) {
    if (isSpecialCharacter(value[i])) {
      numberSpecialCharacters++
    } else if (isSpace(value[i])) {
      // spaces count towards neither
    } else {
      numberRegularCharacters++
    }
  }

  return (
    nicknameWithinCharLimits(value) &&
    hasNoLeadingOrTrailingWhitespace(value) &&
    numberSpecialCharacters <= 2 &&
    numberRegularCharacters >= 1
  )
}

function isValidCity(value) {
  return value.length >= 1 && value.length <= 80
}

function isValidStreet(value) {
  return value.length >= 1 && value.length <= 120
}

function isValidZip(value) {
  return value.length >= 1 && value.length <= 20
}

function isValidState(value) {
  return value.length >= 0 && value.length <= 80
}

function isValidCountry(value) {
  return value !== "none" && value !== "XX"
}

function isValidEmail(value) {
  return value.length >= 1 && value.length <= 200 && /^[^@\s]+@[^@\s]+$/.test(value)
}

function isValidRepeatedEmail(value) {
  return value.length >= 1 && value.length <= 200 && value === document.querySelector('[data-field="email"]').value
}

function isValidPhoneNumber(value) {
  return value.length >= 1 && value.length <= 32
}

function isValidBirthday(value) {
  // we first need to ensure the date value is in ISO date format yyyy-mm-dd (because the backend API expects that)
  // note: if the user is on a modern browser, the date picker will ensure this, but there are oddball browsers that allow typing
  if (/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/.test(value)) {
    // now ensure valid date and not in the future
    const parsedDate = new Date(value)
    return !isNaN(parsedDate.getDate()) && (parsedDate < Date.now())
  }
}

function isValidBirthdayWithLimits(value, oldest, youngest) {
  return isValidBirthday(value) && (value >= oldest) && (value <= youngest)
}

function isValidTelegram(value) {
  return !value.length || value.charAt(0) === "@"
}
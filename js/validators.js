function hasNoLeadingOrTrailingWhitespace(value) {
  return value.trim() === value
}

function isSpecialCharacter(character) {
  return /[^a-zA-Z0-9\u00c0-\u017e\u0400-\u04FF ]/.test(character)
}

function containsAtLeastOneValidChar(value) {
  return /^[^\p{Letter}\p{Number} ]+$/.test(value)
}

function nicknameWithinCharLimits(value) {
  return value.length >= 1 && value.length <= 80
}

export function isValidNickname(value) {
  let numberSpecialCharacters = 0
  let nameWithoutSpecialCharacters = ''

  for (let i = 0; i < value.length; i++) {
    if (isSpecialCharacter) numberSpecialCharacters++
    else nameWithoutSpecialCharacters += value[i]
  }

  return (
    nicknameWithinCharLimits(value) &&
    hasNoLeadingOrTrailingWhitespace(value) &&
    numberSpecialCharacters <= 2 &&
    containsAtLeastOneValidChar(nameWithoutSpecialCharacters)
  )
}

export function isValidCity(value) {
  return value.length >= 1 && value.length <= 80
}

export function isValidStreet(value) {
  return value.length >= 1 && value.length <= 120
}

export function isValidZip(value) {
  return value.length >= 1 && value.length <= 20
}

export function isValidState(value) {
  return value.length >= 0 && value.length <= 80
}

export function isValidCountry(value) {
  return value !== "none"
}

export function isValidEmail(value) {
  return value.length >= 1 && value.length <= 200 && /^[^@\s]+@[^@\s]+$/.test(value)
}

export function isValidRepeatedEmail(value) {
  return value.length >= 1 && value.length <= 200 && value === document.querySelector('[data-field="email"]').value
}

export function isValidPhoneNumber(value) {
  return value.length >= 1 && value.length <= 32
}

export function isValidBirthday(value) {
  return /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/.test(value)
}

export function isValidTelegram(value) {
  return !value.length || value.charAt(0) === "@"
}
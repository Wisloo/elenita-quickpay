const KEY = 'pos.session'

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function setSession(user) {
  sessionStorage.setItem(KEY, JSON.stringify(user))
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}

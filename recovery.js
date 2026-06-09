import { randomBytes, randomInt } from 'crypto'

const CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function randomPassword(length = 10) {
  let out = ''
  const bytes = randomBytes(length)
  for (let i = 0; i < length; i++) {
    out += CHARS[bytes[i] % CHARS.length]
  }
  return out
}

export function buildRecoveryOptions(realPassword) {
  const decoys = new Set()
  while (decoys.size < 3) {
    const d = randomPassword()
    if (d !== realPassword) decoys.add(d)
  }
  return shuffle([realPassword, ...decoys])
}

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
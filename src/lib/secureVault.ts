// 图床密钥「加密保险箱」（纯前端，基于浏览器原生 Web Crypto API）。
//
// 设计目标：在零后端约束下，让用户可选地「记住」图床密钥而不必明文落盘。
//   1. 用 PBKDF2(SHA-256) 从用户口令派生 AES-GCM-256 密钥；
//   2. 每次加密生成随机 salt 与 iv，密文连同 salt/iv 一起以 base64 存入 localStorage；
//   3. 解密时口令错误会因 GCM 认证标签校验失败而直接抛错，天然具备「口令错误」检测能力。
//
// 注意：仅加密真正敏感的字段（AK/SK/token），region/bucket 等非敏感配置仍由 store 正常持久化。

const VAULT_KEY = 'm2v-secret-vault'
// 迭代次数：在安全性与移动端解密耗时之间取平衡
const PBKDF2_ITERATIONS = 250_000
const SALT_BYTES = 16
const IV_BYTES = 12

interface VaultBlob {
  v: 1
  salt: string // base64
  iv: string   // base64
  data: string // base64 ciphertext
}

/** 保险箱中加密保存的敏感字段结构 */
export interface VaultSecrets {
  smms?: { token: string }
  oss?: { accessKeyId: string; accessKeySecret: string }
  cos?: { SecretId: string; SecretKey: string }
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** 当前环境是否支持 Web Crypto（需安全上下文：https 或 localhost） */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle && typeof localStorage !== 'undefined'
}

/** 本地是否已存在加密保险箱 */
export function hasVault(): boolean {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem(VAULT_KEY)
}

/** 清除加密保险箱 */
export function clearVault(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(VAULT_KEY)
}

/** 用口令加密敏感字段并写入保险箱 */
export async function encryptToVault(secrets: VaultSecrets, passphrase: string): Promise<void> {
  if (!isCryptoAvailable()) throw new Error('当前环境不支持加密存储')
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt)
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(secrets)),
  )
  const blob: VaultBlob = {
    v: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(cipher)),
  }
  localStorage.setItem(VAULT_KEY, JSON.stringify(blob))
}

/** 用口令解密保险箱，口令错误时抛错 */
export async function decryptFromVault(passphrase: string): Promise<VaultSecrets> {
  if (!isCryptoAvailable()) throw new Error('当前环境不支持加密存储')
  const raw = localStorage.getItem(VAULT_KEY)
  if (!raw) throw new Error('没有已保存的加密密钥')
  const blob = JSON.parse(raw) as VaultBlob
  const salt = fromBase64(blob.salt)
  const iv = fromBase64(blob.iv)
  const key = await deriveKey(passphrase, salt)
  // 口令错误会在此处因 GCM 认证失败而抛出 DOMException
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    fromBase64(blob.data),
  )
  return JSON.parse(new TextDecoder().decode(plainBuf)) as VaultSecrets
}

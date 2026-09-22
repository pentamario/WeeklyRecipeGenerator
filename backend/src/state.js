import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

export async function readLastWeekUrls(path) {
  try {
    const raw = await readFile(path, 'utf-8')
    return JSON.parse(raw).urls ?? []
  } catch {
    return []
  }
}

export async function writeLastWeekUrls(path, urls) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify({ urls }, null, 2))
}

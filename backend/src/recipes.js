import { readFile } from 'node:fs/promises'

const DAYS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle']

export async function loadRecipes(path) {
  const raw = await readFile(path, 'utf-8')
  return JSON.parse(raw)
}

export function pickWeek(recipes, excludeUrls = []) {
  const excluded = new Set(excludeUrls)
  const pool = recipes.filter((r) => !excluded.has(r.url))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 7)
}

export { DAYS }

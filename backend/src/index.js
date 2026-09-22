import { loadRecipes, pickWeek, DAYS } from './recipes.js'
import { readLastWeekUrls, writeLastWeekUrls } from './state.js'
import { renderWeekPdf } from './render.js'
import { sendPdfToTelegram } from './telegram.js'

const RECIPES_PATH = process.env.RECIPES_PATH || '/data/recipes.json'
const STATE_PATH = process.env.STATE_PATH || '/data/last-week.json'
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars.')
  process.exit(1)
}

async function runWeeklyJob() {
  console.log(`[${new Date().toISOString()}] Generating weekly menu...`)

  const recipes = await loadRecipes(RECIPES_PATH)
  const lastWeekUrls = await readLastWeekUrls(STATE_PATH)
  const week = pickWeek(recipes, lastWeekUrls)

  const pdfBuffer = await renderWeekPdf(DAYS, week)

  const weekLabel = new Date().toISOString().slice(0, 10)
  await sendPdfToTelegram({
    token: TELEGRAM_TOKEN,
    chatId: TELEGRAM_CHAT_ID,
    pdfBuffer,
    filename: `jidelnicek-${weekLabel}.pdf`,
    caption: 'Jídelníček na tento týden 🍽️',
  })

  await writeLastWeekUrls(STATE_PATH, week.map((r) => r.url))

  console.log(`[${new Date().toISOString()}] Sent: ${week.map((r) => r.title).join(', ')}`)
}

runWeeklyJob()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Job failed:', err)
    process.exit(1)
  })

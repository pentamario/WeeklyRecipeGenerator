import puppeteer from 'puppeteer'

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])
}

function renderIngredient(ing) {
  const qty = [ing.quantity, ing.unit].filter(Boolean).join(' ')
  const notes = ing.notes ? ` (${escapeHtml(ing.notes)})` : ''
  return `<li>${qty ? `<strong>${escapeHtml(qty)}</strong> ` : ''}${escapeHtml(ing.name)}${notes}</li>`
}

function renderDay(day, recipe, isLast) {
  const meta = [recipe.cuisine, recipe.prep_time_minutes ? `${recipe.prep_time_minutes} min` : null]
    .filter(Boolean)
    .join(', ')

  return `
    <section class="day${isLast ? '' : ' page-break'}">
      <h2>${escapeHtml(day)} — ${escapeHtml(recipe.title)}</h2>
      ${meta ? `<p class="meta">${escapeHtml(meta)}</p>` : ''}
      <div class="columns">
        <div>
          <h3>Ingredience</h3>
          <ul>${recipe.ingredients.map(renderIngredient).join('')}</ul>
        </div>
        <div>
          <h3>Postup</h3>
          <ol>${recipe.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
        </div>
      </div>
    </section>
  `
}

function buildHtml(days, week) {
  const sections = days.map((day, i) => renderDay(day, week[i], i === days.length - 1)).join('')

  return `
    <!doctype html>
    <html lang="cs">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; margin: 0; padding: 32px 40px; }
        h1 { font-size: 22px; margin: 0 0 24px; }
        h2 { font-size: 18px; margin: 0 0 4px; }
        h3 { font-size: 13px; margin: 0 0 6px; font-family: Helvetica, Arial, sans-serif; }
        p.meta { font-size: 12px; color: #555; margin: 0 0 14px; font-family: Helvetica, Arial, sans-serif; }
        .columns { display: flex; gap: 32px; }
        .columns > div { flex: 1; }
        ul, ol { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5; font-family: Helvetica, Arial, sans-serif; }
        li { margin-bottom: 5px; }
        .page-break { page-break-after: always; break-after: page; }
      </style>
    </head>
    <body>
      <h1>Jídelníček na týden</h1>
      ${sections}
    </body>
    </html>
  `
}

export async function renderWeekPdf(days, week) {
  const html = buildHtml(days, week)

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    return await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', bottom: '0' } })
  } finally {
    await browser.close()
  }
}

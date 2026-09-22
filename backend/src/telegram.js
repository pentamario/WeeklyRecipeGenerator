export async function sendPdfToTelegram({ token, chatId, pdfBuffer, filename, caption }) {
  const form = new FormData()
  form.set('chat_id', chatId)
  form.set('caption', caption)
  form.set('document', new Blob([pdfBuffer], { type: 'application/pdf' }), filename)

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: form,
  })

  const data = await res.json()
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description ?? res.statusText}`)
  }
}

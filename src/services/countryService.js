const API_URL = 'https://countriesnow.space/api/v0.1/countries'
const TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ka&dt=t&q='
const TIMEOUT_MS = 10000

const countryNames = new Intl.DisplayNames(['ka'], { type: 'region' })
const currencyNames = new Intl.DisplayNames(['ka'], { type: 'currency' })

export const numberFormat = new Intl.NumberFormat('ka-GE')

export const flagUrl = (code, width) => `https://flagcdn.com/w${width}/${code.toLowerCase()}.webp`

export const isGeorgian = (text) => /[Ⴀ-ჿ]/.test(text ?? '')

export const displayName = (country) => country.nameKa ?? country.name

function georgianOf(names, code) {
  try {
    const name = code ? names.of(code) : null
    return isGeorgian(name) ? name : null
  } catch {
    return null
  }
}

async function fetchJson(url, signal) {
  const res = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
  })
  if (!res.ok) throw new Error(res.status)
  return res.json()
}

async function getData(url, signal) {
  const json = await fetchJson(url, signal)
  if (json.error) throw new Error(json.msg)
  return json.data
}

export async function fetchCountries(signal) {
  const [info, population] = await Promise.all([
    getData(`${API_URL}/info?returns=iso2,iso3,flag,capital,currency,dialCode`, signal),
    getData(`${API_URL}/population`, signal),
  ])

  const populationByCode = new Map(
    population.map((p) => [p.iso3, p.populationCounts.at(-1)])
  )

  const unique = [...new Map(info.map((c) => [c.iso3 || c.name, c])).values()]

  return unique.map((c) => {
    const pop = populationByCode.get(c.iso3)
    return {
      id: c.iso3 || c.name,
      name: c.name,
      nameKa: c.iso3 === 'GEO' ? 'საქართველო' : georgianOf(countryNames, c.iso2),
      capital: c.capital || null,
      capitalKa: null,
      currency: c.currency || null,
      currencyKa: georgianOf(currencyNames, c.currency),
      dialCode: c.dialCode ? `+${String(c.dialCode).replace('+', '')}` : null,
      population: pop?.value ?? null,
      populationYear: pop?.year ?? null,
      flag: c.iso2 ? flagUrl(c.iso2, 320) : c.flag,
    }
  })
}

async function translateToGeorgian(words, signal) {
  const result = []
  for (let i = 0; i < words.length; i += 50) {
    const part = words.slice(i, i + 50)
    const data = await fetchJson(TRANSLATE_URL + encodeURIComponent(part.join('\n')), signal)
    const lines = data[0].map((s) => s[0]).join('').split('\n').map((s) => s.trim())
    result.push(...(lines.length === part.length ? lines : part))
  }
  return result
}

export async function translateCountries(list, signal) {
  const jobs = [
    ...list.filter((c) => !c.nameKa).map((c) => ({ id: c.id, field: 'nameKa', text: c.name })),
    ...list.filter((c) => c.capital).map((c) => ({ id: c.id, field: 'capitalKa', text: c.capital })),
  ]
  const translated = await translateToGeorgian(jobs.map((j) => j.text), signal)

  const updates = new Map()
  jobs.forEach((job, i) => {
    if (!isGeorgian(translated[i])) return
    updates.set(job.id, { ...updates.get(job.id), [job.field]: translated[i] })
  })
  return updates
}

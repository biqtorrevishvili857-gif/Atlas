import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const API_URL = 'https://countriesnow.space/api/v0.1/countries'
const TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ka&dt=t&q='
const TIMEOUT_MS = 10000

const flagUrl = (code, width) => `https://flagcdn.com/w${width}/${code.toLowerCase()}.webp`

const countryNames = new Intl.DisplayNames(['ka'], { type: 'region' })
const currencyNames = new Intl.DisplayNames(['ka'], { type: 'currency' })
const numberFormat = new Intl.NumberFormat('ka-GE')

const isGeorgian = (text) => /[\u10A0-\u10FF]/.test(text ?? '')

function georgianOf(names, code) {
  try {
    const name = code ? names.of(code) : null
    return isGeorgian(name) ? name : null
  } catch {
    return null
  }
}

const displayName = (country) => country.nameKa ?? country.name

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

async function fetchCountries(signal) {
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

async function translateCountries(list, signal) {
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

const SEARCH_MODES = [
  { value: 'name', label: '🏳️ ქვეყანა' },
  { value: 'capital', label: '🏛️ დედაქალაქი' },
]

const QUICK_SEARCHES = [
  { code: 'jp', text: 'იაპონია' },
  { code: 'br', text: 'ბრაზილია' },
  { code: 'it', text: 'იტალია' },
  { code: 'eg', text: 'ეგვიპტე' },
]

function Header({ favoritesCount, showFavorites, onToggleView, theme, onToggleTheme }) {
  return (
    <header className="header">
      <a className="brand" href="/">
        <span className="brand-icon" aria-hidden="true">🌍</span>
        <span className="brand-text">
          <b>ატლასი</b>
          <small>მსოფლიოს ქვეყნები</small>
        </span>
      </a>

      <nav aria-label="მთავარი მენიუ">
        <a href="#countries">კატალოგი</a>
        <button
          type="button"
          className={showFavorites ? 'fav-pill active' : 'fav-pill'}
          onClick={onToggleView}
          aria-label={showFavorites ? 'ყველა ქვეყნის ჩვენება' : 'რჩეულების ჩვენება'}
        >
          {showFavorites ? '← ყველა' : `♥ ${favoritesCount}`}
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'დღის რეჟიმი' : 'ღამის რეჟიმი'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  )
}

function Hero({ count, query, onQueryChange, searchBy, onSearchByChange, onQuickSearch }) {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="globe-wrap" aria-hidden="true">
        <span className="globe">🌍</span>
        <span className="plane">✈️</span>
      </div>

      <p className="eyebrow">
        {count ? `${count} ქვეყანა ერთ სივრცეში` : 'მსოფლიოს ქვეყნები ერთ სივრცეში'}
      </p>

      <h1 id="hero-title">
        აღმოაჩინე <span>მსოფლიო.</span>
      </h1>

      <p className="hero-description">
        მოძებნე ქვეყნები, გაიგე მათი დედაქალაქი, მოსახლეობა, ვალუტა და ბევრი სხვა.
      </p>

      <form className="finder" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="segmented" role="radiogroup" aria-label="ძიების ტიპი">
          {SEARCH_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              role="radio"
              aria-checked={searchBy === mode.value}
              className={searchBy === mode.value ? 'on' : ''}
              onClick={() => onSearchByChange(mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <label className="search-box">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            name="query"
            placeholder={
              searchBy === 'name'
                ? 'ჩაწერე ქვეყანა — მაგ. საფრანგეთი ან France'
                : 'ჩაწერე დედაქალაქი — მაგ. თბილისი ან Tokyo'
            }
            aria-label="ქვეყნის ან დედაქალაქის ძიება"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => onQueryChange('')}
              aria-label="გასუფთავება"
            >
              ✕
            </button>
          )}
        </label>

        <div className="chips">
          <span>პოპულარული:</span>
          {QUICK_SEARCHES.map((chip) => (
            <button key={chip.text} type="button" onClick={() => onQuickSearch(chip.text)}>
              <img src={flagUrl(chip.code, 40)} alt="" width="18" height="12" />
              {chip.text}
            </button>
          ))}
        </div>
      </form>
    </section>
  )
}

function CountryCard({ country, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <article className="country-card">
      <div className="flag">
        <img
          src={country.flag}
          alt={`${displayName(country)}ს დროშა`}
          width="320"
          height="213"
          loading="lazy"
          decoding="async"
        />
        <span className="code">{country.id}</span>
        <button
          type="button"
          className={isFavorite ? 'fav-btn active' : 'fav-btn'}
          aria-label={isFavorite ? 'რჩეულებიდან წაშლა' : 'რჩეულებში დამატება'}
          onClick={onToggleFavorite}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="country-title">
        <h3>
          <button type="button" className="card-open" onClick={onOpen}>
            {displayName(country)}
          </button>
        </h3>
        {country.nameKa && <p className="english-name">{country.name}</p>}
      </div>

      <div className="country-info">
        <ul>
          <li>
            <span>დედაქალაქი</span>
            {country.capitalKa ?? country.capital ?? '—'}
          </li>
          <li>
            <span>მოსახლეობა</span>
            {country.population ? numberFormat.format(country.population) : '—'}
          </li>
        </ul>
      </div>
    </article>
  )
}

function CountryCatalog({
  countries,
  showFavorites,
  loading,
  error,
  onRetry,
  sortBy,
  onSortChange,
  isFavorite,
  onToggleFavorite,
  onOpen,
  emptyText,
}) {
  return (
    <section className="countries-section" id="countries" aria-labelledby="catalog-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ქვეყნების კატალოგი</p>
          <h2 id="catalog-title">{showFavorites ? 'რჩეული ქვეყნები' : 'მსოფლიოს ქვეყნები'}</h2>
        </div>

        {!loading && !error && (
          <div className="toolbar">
            <span className="count">ნაპოვნია: {countries.length}</span>
            <select
              className="sort"
              aria-label="დალაგება"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="name">ანბანით</option>
              <option value="population">მოსახლეობით</option>
            </select>
          </div>
        )}
      </div>

      {loading && <p className="status">იტვირთება...</p>}

      {error && (
        <div className="status error">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            თავიდან ცდა
          </button>
        </div>
      )}

      {!loading && !error && countries.length === 0 && <p className="status">{emptyText}</p>}

      {!loading && !error && countries.length > 0 && (
        <ul className="countries-grid">
          {countries.map((country) => (
            <li key={country.id}>
              <CountryCard
                country={country}
                isFavorite={isFavorite(country.id)}
                onToggleFavorite={() => onToggleFavorite(country.id)}
                onOpen={() => onOpen(country)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CountryModal({ country, isFavorite, onToggleFavorite, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rows = [
    ['🏛️', 'დედაქალაქი', country.capitalKa ?? country.capital],
    [
      '👥',
      'მოსახლეობა',
      country.population &&
        `${numberFormat.format(country.population)} (${country.populationYear} წ.)`,
    ],
    [
      '💰',
      'ვალუტა',
      country.currency &&
        `${country.currencyKa && country.currencyKa !== country.currency ? country.currencyKa + ' · ' : ''}${country.currency}`,
    ],
    ['📞', 'სატელეფონო კოდი', country.dialCode],
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={displayName(country)}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="დახურვა"
        >
          ✕
        </button>

        <img
          className="modal-flag"
          src={country.flag}
          alt={`${displayName(country)}ს დროშა`}
          width="320"
          height="213"
          decoding="async"
        />

        <div className="modal-body">
          <h2>{displayName(country)}</h2>
          {country.nameKa && <p className="english-name">{country.name}</p>}

          <ul className="modal-facts">
            {rows.map(([icon, label, value]) => (
              <li key={label}>
                <span className="icon">{icon}</span>
                <span className="label">{label}</span>
                <b>{value || '—'}</b>
              </li>
            ))}
          </ul>

          <div className="modal-actions">
            <button type="button" className="primary" onClick={onToggleFavorite}>
              {isFavorite ? '♥ რჩეულებიდან წაშლა' : '♡ რჩეულებში დამატება'}
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.name)}`}
              target="_blank"
              rel="noreferrer"
            >
              🗺️ რუკაზე
            </a>
            <a
              href={`https://ka.wikipedia.org/wiki/${encodeURIComponent(displayName(country))}`}
              target="_blank"
              rel="noreferrer"
            >
              📖 ვიკიპედია
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <a className="brand" href="/">
        <span className="brand-icon" aria-hidden="true">🌍</span>
        <span className="brand-text">
          <b>ატლასი</b>
          <small>მსოფლიოს ქვეყნები</small>
        </span>
      </a>
      <p>მონაცემები: CountriesNow API · დროშები: flagcdn.com</p>
    </footer>
  )
}

function App() {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [query, setQuery] = useState('')
  const [searchBy, setSearchBy] = useState('name')
  const [sortBy, setSortBy] = useState('name')

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites')) ?? []
    } catch {
      return []
    }
  })
  const [showFavorites, setShowFavorites] = useState(false)
  const [selected, setSelected] = useState(null)

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') ?? 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      return
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites))
    } catch {
      return
    }
  }, [favorites])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      let list
      try {
        list = await fetchCountries(controller.signal)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(
          err.name === 'TimeoutError'
            ? 'სერვერი 10 წამში არ პასუხობს. სცადე თავიდან.'
            : 'ქვეყნების ჩატვირთვა ვერ მოხერხდა. შეამოწმე ინტერნეტი და სცადე თავიდან.'
        )
        setLoading(false)
        return
      }
      setCountries(list)
      setLoading(false)

      try {
        const updates = await translateCountries(list, controller.signal)
        setCountries((prev) => prev.map((c) => ({ ...c, ...updates.get(c.id) })))
      } catch {
        return
      }
    }

    load()
    return () => controller.abort()
  }, [reloadKey])

  const visibleCountries = useMemo(() => {
    const text = query.trim().toLowerCase()
    const source = showFavorites ? countries.filter((c) => favorites.includes(c.id)) : countries

    const found = source.filter((c) => {
      if (!text) return true
      const fields = searchBy === 'name' ? [c.nameKa, c.name] : [c.capitalKa, c.capital]
      return fields.some((f) => f?.toLowerCase().includes(text))
    })

    return [...found].sort((a, b) => {
      if (sortBy === 'population') return (b.population ?? 0) - (a.population ?? 0)
      if (a.id === 'GEO') return -1
      if (b.id === 'GEO') return 1
      return displayName(a).localeCompare(displayName(b), 'ka')
    })
  }, [countries, favorites, showFavorites, query, searchBy, sortBy])

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const isFavorite = (id) => favorites.includes(id)

  function quickSearch(text) {
    setSearchBy('name')
    setQuery(text)
    setShowFavorites(false)
    document.getElementById('countries')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
      <Header
        favoritesCount={favorites.length}
        showFavorites={showFavorites}
        onToggleView={() => setShowFavorites(!showFavorites)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <main>
        <Hero
          count={countries.length}
          query={query}
          onQueryChange={setQuery}
          searchBy={searchBy}
          onSearchByChange={setSearchBy}
          onQuickSearch={quickSearch}
        />

        <CountryCatalog
          countries={visibleCountries}
          showFavorites={showFavorites}
          loading={loading}
          error={error}
          onRetry={() => setReloadKey((k) => k + 1)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onOpen={setSelected}
          emptyText={
            showFavorites && favorites.length === 0
              ? 'რჩეულებში ჯერ არაფერია. დააჭირე ♡ ბარათზე.'
              : 'ასეთი ქვეყანა ვერ მოიძებნა.'
          }
        />
      </main>

      <Footer />

      {selected && (
        <CountryModal
          country={countries.find((c) => c.id === selected.id) ?? selected}
          isFavorite={isFavorite(selected.id)}
          onToggleFavorite={() => toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export default App
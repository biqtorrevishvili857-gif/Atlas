import { useEffect, useMemo, useState } from 'react'
import './app.css'
import { displayName, fetchCountries, translateCountries } from './services/countryService'
import Header from './components/Header'
import Hero from './components/Hero'
import CountryList from './components/CountryList'
import CountryModal from './components/CountryModal'
import Footer from './components/Footer'

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

        <CountryList
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

import CountryCard from './CountryCard'

function CountryList({
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

export default CountryList

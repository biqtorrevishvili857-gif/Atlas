import { displayName, numberFormat } from '../services/countryService'

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

export default CountryCard

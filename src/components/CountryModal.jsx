import { useEffect, useRef } from 'react'
import { displayName, numberFormat } from '../services/countryService'

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

export default CountryModal

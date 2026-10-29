import { flagUrl } from '../services/countryService'

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

function Filter({ query, onQueryChange, searchBy, onSearchByChange, onQuickSearch }) {
  return (
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
  )
}

export default Filter

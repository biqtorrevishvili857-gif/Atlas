
const SAMPLE_COUNTRIES = [
    { id: 'GEO', nameKa: 'საქართველო', name: 'Georgia', capital: 'თბილისი', population: '3,726,549', flag: 'https://flagcdn.com/w320/ge.png' },
    { id: 'JPN', nameKa: 'იაპონია', name: 'Japan', capital: 'ტოკიო', population: '126,529,100', flag: 'https://flagcdn.com/w320/jp.png' },
    { id: 'BRA', nameKa: 'ბრაზილია', name: 'Brazil', capital: 'ბრაზილია', population: '209,469,333', flag: 'https://flagcdn.com/w320/br.png' },
    { id: 'ITA', nameKa: 'იტალია', name: 'Italy', capital: 'რომი', population: '60,431,283', flag: 'https://flagcdn.com/w320/it.png' },
    { id: 'EGY', nameKa: 'ეგვიპტე', name: 'Egypt', capital: 'კაირო', population: '98,423,595', flag: 'https://flagcdn.com/w320/eg.png' },
    { id: 'FRA', nameKa: 'საფრანგეთი', name: 'France', capital: 'პარიზი', population: '66,987,244', flag: 'https://flagcdn.com/w320/fr.png' },
  ]
  
  const QUICK_SEARCHES = ['იაპონია', 'ბრაზილია', 'იტალია', 'ეგვიპტე']
  
  
  
  function Header() {
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
          <button type="button" className="fav-pill" aria-label="რჩეულების ჩვენება">
            ♥ 0
          </button>
          <button type="button" className="theme-toggle" aria-label="ღამის რეჟიმი">
            🌙
          </button>
        </nav>
      </header>
    )
  }
  
  function Hero() {
    return (
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="globe-wrap" aria-hidden="true">
          <span className="globe">🌍</span>
          <span className="plane">✈️</span>
        </div>
  
        <p className="eyebrow">მსოფლიოს ქვეყნები ერთ სივრცეში</p>
  
        <h1 id="hero-title">
          აღმოაჩინე <span>მსოფლიო.</span>
        </h1>
  
        <p className="hero-description">
          მოძებნე ქვეყნები, გაიგე მათი დედაქალაქი, მოსახლეობა, ვალუტა და ბევრი სხვა.
        </p>
  
        {}
        <form className="finder" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="segmented" role="radiogroup" aria-label="ძიების ტიპი">
            <button type="button" role="radio" aria-checked="true" className="on">
              🏳️ ქვეყანა
            </button>
            <button type="button" role="radio" aria-checked="false">
              🏛️ დედაქალაქი
            </button>
          </div>
  
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              name="query"
              placeholder="ჩაწერე ქვეყანა — მაგ. საფრანგეთი ან France"
              aria-label="ქვეყნის ან დედაქალაქის ძიება"
            />
          </label>
  
          <div className="chips">
            <span>პოპულარული:</span>
            {QUICK_SEARCHES.map((name) => (
              <button key={name} type="button">
                {name}
              </button>
            ))}
          </div>
        </form>
      </section>
    )
  }
  
  function CountryCard({ country }) {
    return (
      <article className="country-card">
        <div className="flag">
          <img src={country.flag} alt={`${country.nameKa}ს დროშა`} loading="lazy" />
          <span className="code">{country.id}</span>
          <button type="button" className="fav-btn" aria-label="რჩეულებში დამატება">
            ♡
          </button>
        </div>
  
        <div className="country-title">
          <h3>
            <button type="button" className="card-open">
              {country.nameKa}
            </button>
          </h3>
          <p className="english-name">{country.name}</p>
        </div>
  
        <div className="country-info">
          <ul>
            <li>
              <span>დედაქალაქი</span>
              {country.capital}
            </li>
            <li>
              <span>მოსახლეობა</span>
              {country.population}
            </li>
          </ul>
        </div>
      </article>
    )
  }
  
  function CountryCatalog({ countries }) {
    return (
      <section className="countries-section" id="countries" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ქვეყნების კატალოგი</p>
            <h2 id="catalog-title">მსოფლიოს ქვეყნები</h2>
          </div>
  
          <div className="toolbar">
            <span className="count">ნაპოვნია: {countries.length}</span>
            <select className="sort" aria-label="დალაგება" defaultValue="name">
              <option value="name">ანბანით</option>
              <option value="population">მოსახლეობით</option>
            </select>
          </div>
        </div>
  
        <ul className="countries-grid">
          {countries.map((country) => (
            <li key={country.id}>
              <CountryCard country={country} />
            </li>
          ))}
        </ul>
      </section>
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
    return (
      <div className="app">
        <Header />
  
        <main>
          <Hero />
          <CountryCatalog countries={SAMPLE_COUNTRIES} />
        </main>
  
        <Footer />
      </div>
    )
  }
  
  export default App
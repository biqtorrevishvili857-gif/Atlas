import Filter from './Filter'

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

      <Filter
        query={query}
        onQueryChange={onQueryChange}
        searchBy={searchBy}
        onSearchByChange={onSearchByChange}
        onQuickSearch={onQuickSearch}
      />
    </section>
  )
}

export default Hero

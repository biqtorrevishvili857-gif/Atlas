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

export default Header

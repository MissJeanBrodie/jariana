import { Link } from 'react-router-dom'
import { useArtworks, seasonLabel, longDate } from '../data/useArtworks.js'
import './CardGallery.css'

function Placard({ art, index }) {
  return (
    <figcaption className="plate__placard">
      <p className="plate__title">{art.title}</p>
      <p className="plate__meta">{seasonLabel(art)}</p>
      <p className="plate__line">Promotional still · broadcast {longDate(art)}</p>
      <p className="plate__acc">Acc. no. MitM·{String(index + 1).padStart(3, '0')}</p>
    </figcaption>
  )
}

export default function CardGallery() {
  const { artworks, loading } = useArtworks()
  const [a, b, ...rest] = artworks

  return (
    <main className="cards">
      <header className="cards__masthead">
        <Link to="/" className="cards__back">← Lobby</Link>
        <div className="cards__title-wrap">
          <p className="cards__kicker">Unnamed Art Project · Gallery I</p>
          <h1 className="cards__title">The Card Gallery</h1>
        </div>
        <p className="cards__note">
          Placeholder imagery — promotional stills from <em>Malcolm in the Middle</em>, 2000–2006 —
          hung salon-style. {loading ? 'Hanging the show…' : `${artworks.length} plates on view.`}
        </p>
      </header>

      {/* Featured diptych — the "two card pics" */}
      {a && b && (
        <section className="diptych" aria-label="Featured diptych">
          {[a, b].map((art, i) => (
            <figure className="plate plate--feature" key={art.id} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="plate__frame plate__frame--feature">
                <img src={art.img} alt={art.title} loading="lazy" />
              </div>
              <Placard art={art} index={i} />
            </figure>
          ))}
        </section>
      )}

      <div className="cards__rule">
        <span>Gallery II — The Open Wall</span>
        <span>Salon hang</span>
      </div>

      {/* Masonry of the rest */}
      <section className="masonry" aria-label="Collection">
        {rest.map((art, i) => (
          <figure className="plate" key={art.id} style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}>
            <div className="plate__frame">
              <img src={art.img} alt={art.title} loading="lazy" />
            </div>
            <Placard art={art} index={i + 2} />
          </figure>
        ))}
      </section>

      <footer className="cards__foot">
        <span>Unnamed Art Project · Gallery I</span>
        <Link to="/museum" className="cards__cta">See it as an infinite hall →</Link>
      </footer>
    </main>
  )
}

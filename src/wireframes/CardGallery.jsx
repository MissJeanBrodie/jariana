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
  const shown = artworks.slice(0, 10)

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
          hung salon-style. {loading ? 'Hanging the show…' : `${shown.length} plates on view.`}
        </p>
      </header>

      <section className="cards__grid" aria-label="Collection">
        {shown.map((art, i) => (
          <figure className="plate" key={art.id} style={{ animationDelay: `${Math.min(i, 9) * 0.06}s` }}>
            <div className="plate__frame">
              <img src={art.img} alt={art.title} loading="lazy" />
            </div>
            <Placard art={art} index={i} />
          </figure>
        ))}
      </section>

      <footer className="cards__foot">
        <span>Unnamed Art Project · Gallery I</span>
        <Link to="/museum" className="cards__cta">Infinite hall →</Link>
      </footer>
    </main>
  )
}
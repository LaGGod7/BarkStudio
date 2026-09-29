import AnimatedHeading from './AnimatedHeading';
import Stage from './Stage';

const SECTORS_DATA = [
  {
    title: 'Content & Creator Economy',
    description: 'Turn audiences into recurring revenue and keep members subscribed.',
    features: ['Membership retention', 'Launch and renewal flows', 'Operations automation'],
  },
  {
    title: 'Digital & Performance Agencies',
    description: 'Give every client the same retention system without rebuilding it each time.',
    features: ['Client-ready reporting', 'Repeatable funnel templates', 'Shared revenue view'],
  },
  {
    title: 'B2B Software & Enterprise',
    description: 'Find churn risk early and act on it while the account is still healthy.',
    features: ['Churn prevention', 'Renewal forecasting', 'Expansion signals'],
  },
  {
    title: 'Modern E-Commerce Brands',
    description: 'Lift lifetime value with repeat-purchase timing based on real order history.',
    features: ['Repeat-purchase automation', 'Win-back sequences', 'Cohort LTV tracking'],
  },
];

export default function Sectors() {
  return (
    <section id="sectors" className="wrap" style={{ paddingTop: 0 }}>
      <AnimatedHeading text="Built for four kinds of business." className="h2" />
      <Stage tint="pink">
        <div className="pillars">
          {SECTORS_DATA.map((sector, index) => (
            <article key={sector.title} className="pillar" tabIndex={0}>
              <div className="rv" style={{ '--d': index }}>
                <h3>{sector.title}</h3>
                <p>{sector.description}</p>
              </div>
              <ul className="rv" style={{ '--d': index }}>
                {sector.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Stage>
    </section>
  );
}

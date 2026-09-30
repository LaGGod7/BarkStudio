import AnimatedHeading from './AnimatedHeading';

export default function About() {
  return (
    <section id="about" className="wrap">
      <div className="about">
        <AnimatedHeading text="Software as a Product." className="h2" />
        <div>
          <p className="rv" style={{ '--d': 0 }}>
            Growth work usually arrives as a chain of agencies, freelancers and dashboards that never quite connect. Handoffs slow everything down, and reports arrive after the moment to act has passed.
          </p>
          <p className="rv" style={{ '--d': 1 }}>
            BarkStudio builds that work into software instead. Our first product, AtRisk, shows you which customers are likely to leave and triggers the right response automatically.
          </p>
          <p className="rv" style={{ '--d': 2 }}>
            We're a product studio. AtRisk is the first product, with more to follow.
          </p>
        </div>
      </div>
    </section>
  );
}

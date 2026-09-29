import AnimatedHeading from './AnimatedHeading';

export default function About() {
  return (
    <section id="about" className="wrap">
      <div className="about">
        <AnimatedHeading text="Service as a Product." className="h2" />
        <div>
          <p className="rv" style={{ '--d': 0 }}>
            Most growth work arrives as a chain of agencies, freelancers and dashboards that never quite connect. Every handoff leaks revenue and every report arrives late.
          </p>
          <p className="rv" style={{ '--d': 1 }}>
            BarkStudio builds that work into software. Retention, revenue analytics and lifecycle automation live in one product, tuned by the same team that runs the playbooks behind it.
          </p>
          <p className="rv" style={{ '--d': 2 }}>
            Our mission is to replace fragmented agency friction with unified, high-retention products that keep customers longer and make revenue predictable.
          </p>
        </div>
      </div>
    </section>
  );
}

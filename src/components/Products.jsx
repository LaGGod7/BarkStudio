import { useState } from 'react';
import AnimatedHeading from './AnimatedHeading';
import Stage from './Stage';

export default function Products({ onEarlyAccessClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onEarlyAccessClick) {
      onEarlyAccessClick();
    } else {
      const waitlist = document.getElementById('waitlist');
      const input = document.getElementById('wl');
      waitlist?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => input?.focus(), 500);
    }
  };

  const handleRowKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <section id="products" className="wrap" style={{ paddingTop: 'clamp(40px, 6vw, 96px)', paddingBottom: 'clamp(80px, 12vw, 160px)' }}>
      <AnimatedHeading text="Our first product." className="h2" />
      <div className="atrisk-container">
        <Stage tint="green" className={`atrisk-stage ${isOpen ? 'open-stage' : ''}`}>
          <div className="rows">
            <div className={`item ${isOpen ? 'open' : ''}`}>
              <div
                className="row"
                onClick={toggleOpen}
                onKeyDown={handleRowKeyDown}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls="atrisk-details"
              >
                <h3 className="rv">AtRisk</h3>
                <p className="rv" style={{ '--d': 1 }}>
                  Churn risk score per customer.
                </p>
                <button
                  type="button"
                  className="atrisk-badge"
                  onClick={handleActionClick}
                  title="Click to request early access"
                  aria-label="Request early access to AtRisk"
                >
                  Early access
                </button>
              </div>

              <div className="more" id="atrisk-details">
                <div>
                  <ul>
                    <li>Real-time predictive churn scoring based on telemetry &amp; billing</li>
                    <li>Automated retention playbooks triggered before cancellation</li>
                    <li>Direct two-way synchronization with Stripe, Paddle &amp; HubSpot</li>
                    <li>Account expansion indicators for accounts with high health</li>
                    <li>Weekly cohort health reports sent directly to your leadership</li>
                    <li>Customizable retention rules tailored to your pricing tiers</li>
                  </ul>
                  <div className="atrisk-cta-wrap">
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={handleActionClick}
                      style={{ fontSize: 14, padding: '9px 18px' }}
                    >
                      Request Early Access to AtRisk &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Stage>
      </div>
    </section>
  );
}

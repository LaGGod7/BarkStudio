import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleWaitlistClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const waitlistSection = document.getElementById('waitlist');
    const input = document.getElementById('wl');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        input?.focus();
      }, 500);
    }
  };

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="wrap">
      <a
        className="mark"
        href="#top"
        aria-label="BarkStudio home"
        onClick={(e) => handleScrollTo(e, 'top')}
      >
        <i />
        BARK STUDIO
      </a>
      <nav aria-label="Primary" className="desktop-nav">
        <a className="l" href="#about" onClick={(e) => handleScrollTo(e, 'about')}>
          About
        </a>
        <a className="l" href="#sectors" onClick={(e) => handleScrollTo(e, 'sectors')}>
          Sectors
        </a>
        <a className="l" href="#products" onClick={(e) => handleScrollTo(e, 'products')}>
          Products
        </a>
        <a className="l" href="#contact" onClick={(e) => handleScrollTo(e, 'contact')}>
          Contact
        </a>
        <a className="btn" href="#waitlist" onClick={handleWaitlistClick}>
          Join Waitlist
        </a>
      </nav>

      {/* Mobile Actions: Compact CTA + Hamburger */}
      <div className="mobile-header-actions">
        <a className="btn mobile-header-btn" href="#waitlist" onClick={handleWaitlistClick}>
          Waitlist
        </a>
        <button
          type="button"
          className={`menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-nav-links">
          <a className="mobile-nav-item" href="#about" onClick={(e) => handleScrollTo(e, 'about')}>
            About
          </a>
          <a className="mobile-nav-item" href="#sectors" onClick={(e) => handleScrollTo(e, 'sectors')}>
            Sectors
          </a>
          <a className="mobile-nav-item" href="#products" onClick={(e) => handleScrollTo(e, 'products')}>
            Products
          </a>
          <a className="mobile-nav-item" href="#contact" onClick={(e) => handleScrollTo(e, 'contact')}>
            Contact
          </a>
          <a className="btn mobile-drawer-cta" href="#waitlist" onClick={handleWaitlistClick}>
            Join Waitlist &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  const handleWaitlistClick = (e) => {
    e.preventDefault();
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
      <nav aria-label="Primary">
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
    </header>
  );
}

export default function Footer({ onOpenTerms, onOpenPrivacy }) {
  const handleScrollToTop = (e) => {
    e.preventDefault();
    const top = document.getElementById('top');
    if (top) {
      top.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer>
      <div className="wrap footer-wrap">
        <span className="footer-copy">
          &copy; 2026 BarkStudio. All rights reserved.
        </span>
        <div className="footer-links">
          <button type="button" data-d="terms" onClick={onOpenTerms}>
            Terms of Service
          </button>
          <button type="button" data-d="privacy" onClick={onOpenPrivacy}>
            Privacy Policy
          </button>
          <button
            type="button"
            className="footer-top-btn"
            onClick={handleScrollToTop}
            title="Scroll to top"
          >
            Top &uarr;
          </button>
        </div>
      </div>
    </footer>
  );
}

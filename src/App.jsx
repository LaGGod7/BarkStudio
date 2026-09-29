import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Sectors from './components/Sectors';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Modal from './components/Modal';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  const [activeModal, setActiveModal] = useState(null);

  // Hook for intersection observer reveal effects
  useScrollReveal();

  const handleOpenTerms = () => setActiveModal('terms');
  const handleOpenPrivacy = () => setActiveModal('privacy');
  const handleCloseModal = () => setActiveModal(null);

  const handleEarlyAccessFocus = () => {
    const waitlist = document.getElementById('waitlist');
    const input = document.getElementById('wl');
    if (waitlist) {
      waitlist.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => input?.focus(), 500);
    }
  };

  return (
    <>
      <Header />

      <main id="top">
        <Hero />
        <About />
        <Sectors />
        <Products onEarlyAccessClick={handleEarlyAccessFocus} />
        <Contact />
      </main>

      <Footer
        onOpenTerms={handleOpenTerms}
        onOpenPrivacy={handleOpenPrivacy}
      />

      <Modal
        id="terms"
        labelledBy="tt"
        title="Terms of Service"
        isOpen={activeModal === 'terms'}
        onClose={handleCloseModal}
      >
        <p>Last updated September 2026. By using this website you agree to these terms.</p>
        <h3>Use of the site</h3>
        <p>
          This site provides information about BarkStudio and lets you join an early-access waitlist or
          send an inquiry. Use it lawfully and do not attempt to disrupt or misuse it.
        </p>
        <h3>Waitlist</h3>
        <p>
          Joining the waitlist reserves interest only. It creates no contract, guarantees no access
          date and involves no payment.
        </p>
        <h3>Products in development</h3>
        <p>Descriptions of upcoming products are plans and may change before release.</p>
        <h3>Liability</h3>
        <p>
          The site is provided as is. To the extent the law allows, BarkStudio is not liable for
          losses arising from its use.
        </p>
        <h3>Contact</h3>
        <p>Questions about these terms: barkstudio7@gmail.com.</p>
      </Modal>

      <Modal
        id="privacy"
        labelledBy="pt"
        title="Privacy Policy"
        isOpen={activeModal === 'privacy'}
        onClose={handleCloseModal}
      >
        <p>Last updated September 2026. This explains what we collect and why.</p>
        <h3>What we collect</h3>
        <p>
          Your email for the waitlist, and your name, email, sector and message when you send an
          inquiry.
        </p>
        <h3>Where it is stored</h3>
        <p>
          In this early version, entries are saved in your own browser's local storage on your device.
          If we connect a server later, this policy will be updated first.
        </p>
        <h3>How we use it</h3>
        <p>
          To contact you about early access and to answer your inquiry. We do not sell your data.
        </p>
        <h3>Your choices</h3>
        <p>
          Clear your browser storage to remove locally saved entries, or email us to ask about any
          data you have sent us.
        </p>
        <h3>Contact</h3>
        <p>barkstudio7@gmail.com.</p>
      </Modal>
    </>
  );
}

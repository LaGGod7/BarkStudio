import { useState } from 'react';
import FluidCanvas from './FluidCanvas';
import HeroTitle from './HeroTitle';
import { EMAIL_REGEX, getFromStorage, putInStorage } from '../utils/storage';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setStatusMessage('Enter a valid email address, for example name@company.com.');
      setIsError(true);
      document.getElementById('wl')?.focus();
      return;
    }

    const waitlist = getFromStorage('bark_waitlist');
    if (waitlist.includes(cleanEmail)) {
      setStatusMessage('That email is already on the waitlist.');
      setIsError(false);
      return;
    }

    waitlist.push(cleanEmail);
    const saved = putInStorage('bark_waitlist', waitlist);

    if (!saved) {
      setStatusMessage('Your browser blocked saving. Allow site storage and try again.');
      setIsError(true);
      return;
    }

    setEmail('');
    setIsError(false);
    setStatusMessage('You are on the list. We will email you when early access opens.');
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (isError) {
      setStatusMessage('');
      setIsError(false);
    }
  };

  return (
    <section className="hero wrap" style={{ paddingTop: 0, paddingBottom: 64 }}>
      <FluidCanvas />
      <HeroTitle />
      <p className="sub">Revenue Engineering &amp; Retention Product Lab</p>
      <form className="inline" id="waitlist" onSubmit={handleSubmit} noValidate>
        <label htmlFor="wl" style={{ position: 'absolute', left: '-9999px' }}>
          Email address
        </label>
        <input
          id="wl"
          type="email"
          placeholder="Your work email"
          autoComplete="email"
          required
          value={email}
          onChange={handleInputChange}
        />
        <button className="btn" type="submit">
          Join the waitlist
        </button>
      </form>
      <p className={`msg${isError ? ' e' : ''}`} id="wlm" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}

import { useState } from 'react';
import FluidCanvas from './FluidCanvas';
import HeroTitle from './HeroTitle';
import { EMAIL_REGEX, getFromStorage, putInStorage } from '../utils/storage';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setStatusMessage('Enter a valid email address, for example name@company.com.');
      setIsError(true);
      setIsSuccess(false);
      document.getElementById('wl')?.focus();
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Joining waitlist...');
    setIsError(false);
    setIsSuccess(false);

    try {
      const submitData = new FormData();
      submitData.append('access_key', 'f1d6abfa-786b-4f9c-a7f8-7306b5d6e04b');
      submitData.append('email', cleanEmail);
      submitData.append('subject', `New BarkStudio Waitlist Signup: ${cleanEmail}`);
      submitData.append('from_name', 'BarkStudio Waitlist');
      submitData.append('message', `A new subscriber has joined the BarkStudio waitlist: ${cleanEmail}`);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      // Local storage backup
      const waitlist = getFromStorage('bark_waitlist');
      if (!waitlist.includes(cleanEmail)) {
        waitlist.push(cleanEmail);
        putInStorage('bark_waitlist', waitlist);
      }

      setEmail('');
      setIsError(false);
      setIsSuccess(true);
      setStatusMessage('You are on the list! We will email you when early access opens.');
    } catch {
      // If network fails, still ensure email is stored locally
      const waitlist = getFromStorage('bark_waitlist');
      if (!waitlist.includes(cleanEmail)) {
        waitlist.push(cleanEmail);
        putInStorage('bark_waitlist', waitlist);
      }

      setEmail('');
      setIsError(false);
      setIsSuccess(true);
      setStatusMessage('You are on the list! We will email you when early access opens.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (isError || isSuccess) {
      setStatusMessage('');
      setIsError(false);
      setIsSuccess(false);
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
          disabled={isSubmitting}
          value={email}
          onChange={handleInputChange}
        />
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Joining...' : 'Join the waitlist'}
        </button>
      </form>
      <p className={`msg${isError ? ' e' : ''}${isSuccess ? ' s' : ''}`} id="wlm" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}

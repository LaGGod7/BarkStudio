import { useState } from 'react';
import AnimatedHeading from './AnimatedHeading';
import InteractiveLogo from './InteractiveLogo';
import { EMAIL_REGEX, getFromStorage, putInStorage } from '../utils/storage';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sector: 'Creator',
    message: '',
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id === 'cn' ? 'name' : id === 'ce' ? 'email' : id === 'cs' ? 'sector' : 'message']: value,
    }));

    if (isError) {
      setStatusMessage('');
      setIsError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameTrimmed = formData.name.trim();
    const emailTrimmed = formData.email.trim();
    const messageTrimmed = formData.message.trim();

    if (!nameTrimmed) {
      setStatusMessage('Enter your name.');
      setIsError(true);
      document.getElementById('cn')?.focus();
      return;
    }

    if (!EMAIL_REGEX.test(emailTrimmed)) {
      setStatusMessage('Enter a valid email address.');
      setIsError(true);
      document.getElementById('ce')?.focus();
      return;
    }

    if (messageTrimmed.length < 10) {
      setStatusMessage('Write a message of at least 10 characters.');
      setIsError(true);
      document.getElementById('cm')?.focus();
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Sending inquiry...');
    setIsError(false);

    try {
      const submitData = new FormData();
      submitData.append('access_key', 'f1d6abfa-786b-4f9c-a7f8-7306b5d6e04b');
      submitData.append('name', nameTrimmed);
      submitData.append('email', emailTrimmed);
      submitData.append('sector', formData.sector);
      submitData.append('message', messageTrimmed);
      submitData.append('subject', `New BarkStudio Inquiry from ${nameTrimmed} (${formData.sector})`);
      submitData.append('from_name', 'BarkStudio Website');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        // Save local backup as well
        const inquiries = getFromStorage('bark_inquiries');
        inquiries.push({
          n: nameTrimmed,
          e: emailTrimmed,
          s: formData.sector,
          m: messageTrimmed,
          at: new Date().toISOString(),
        });
        putInStorage('bark_inquiries', inquiries);

        setFormData({
          name: '',
          email: '',
          sector: 'Creator',
          message: '',
        });
        setIsError(false);
        setStatusMessage('Inquiry sent! We reply within two business days.');
      } else {
        setIsError(true);
        setStatusMessage(data.message || 'Error sending inquiry. Please email barkstudio7@gmail.com directly.');
      }
    } catch {
      setIsError(true);
      setStatusMessage('Network error. Please email barkstudio7@gmail.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="wrap">
      <AnimatedHeading text="Talk to the lab." className="h2" />
      <div className="contact">
        <div className="contact-info">
          <p
            className="rv"
            style={{ color: 'var(--silver)', marginTop: 0, maxWidth: '36ch', '--d': 0 }}
          >
            Partnership, pilot or press inquiry, send it here and we reply within two business days.
          </p>
          <a
            className="mail rv"
            href="mailto:barkstudio7@gmail.com"
            style={{ '--d': 1 }}
          >
            barkstudio7@gmail.com
          </a>
          <InteractiveLogo />
        </div>
        <form
          id="cf"
          className="rv"
          style={{ '--d': 0 }}
          onSubmit={handleSubmit}
          noValidate
        >
          <label htmlFor="cn">Name</label>
          <input
            id="cn"
            name="name"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label htmlFor="ce">Email</label>
          <input
            id="ce"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <label htmlFor="cs">Sector or company</label>
          <select
            id="cs"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="Creator">Creator</option>
            <option value="Agency">Agency</option>
            <option value="B2B software">B2B software</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="cm">Message</label>
          <textarea
            id="cm"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send inquiry'}
          </button>
          <p className={`msg${isError ? ' e' : ''}`} id="cfm" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </form>
      </div>
    </section>
  );
}

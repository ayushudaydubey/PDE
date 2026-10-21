import { toast } from 'react-toastify';

/**
 * TD Webmail (Roundcube) base URL.
 * Roundcube supports pre-filled compose via query params:
 *   _task=mail&_action=compose&_to=&_from=&_subject=
 */
const WEBMAIL_BASE_URL = 'https://mail.gnosysdigital.com/';

/**
 * Opens the TD Webmail (Roundcube) compose window.
 * Pre-fills:
 *   - To:      the company's email address
 *   - From:    the logged-in user's email address
 *   - Subject: "Business Inquiry - {Company Name}"
 *
 * @param {string} toEmail       - The company's email address (recipient)
 * @param {string} companyName   - The company's name (for subject line)
 * @param {object} user          - The logged-in user object
 * @returns {boolean}            - true if opened, false if validation failed
 */
export const openMailComposer = (toEmail, companyName = '', user = null) => {
  // Validate recipient email
  if (!toEmail || typeof toEmail !== 'string' || toEmail.trim() === '') {
    toast.warning('No email address available for this company.');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail.trim())) {
    toast.error('The provided email address is invalid.');
    return false;
  }

  const fromEmail = user?.email;
  const userRole = user?.role;
  const subject = `Business Inquiry - ${companyName || 'Company'}`;

  if (userRole === 'cold_mail') {
    // For cold_mail users, redirect to Gmail compose window
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail.trim())}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    return true;
  }

  let webmailBaseUrl = 'https://mail.gnosysdigital.com/'; // Default fallback

  if (fromEmail) {
    const emailLower = fromEmail.trim().toLowerCase();
    if (emailLower.endsWith('@sginc.ca')) {
      webmailBaseUrl = 'http://mail.sginc.ca/';
    } else if (emailLower.endsWith('@gnosysdigital.com')) {
      webmailBaseUrl = 'https://mail.gnosysdigital.com/';
    }
  }

  // Build Roundcube compose URL with pre-filled fields
  const params = new URLSearchParams({
    _task: 'mail',
    _action: 'compose',
    _to: toEmail.trim(),
    _subject: subject,
  });

  // Pre-fill From only if logged-in user's email is available
  if (fromEmail && emailRegex.test(fromEmail.trim())) {
    params.set('_from', fromEmail.trim());
  }

  const composeUrl = `${webmailBaseUrl}?${params.toString()}`;

  window.open(composeUrl, '_blank', 'noopener,noreferrer');
  return true;
};

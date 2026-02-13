export default function PrivacyPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: February 13, 2026</em></p>

        <h2>Data Collection</h2>
        <p>
          We collect only the information you provide through our contact form: name, email, 
          company name, industry, and your message. This data is used solely to respond to 
          your inquiry.
        </p>

        <h2>Data Storage</h2>
        <p>
          Contact form submissions are stored in our secure PostgreSQL database with encryption 
          at rest. Email addresses are hashed for deduplication purposes.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Resend</strong> - Email delivery</li>
          <li><strong>Vercel</strong> - Website hosting and analytics</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use only essential cookies required for website functionality. No tracking or 
          advertising cookies are used.
        </p>

        <h2>Your Rights (GDPR)</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing</li>
          <li>Data portability</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a href="mailto:david@candengo.com">david@candengo.com</a>.
        </p>

        <h2>Contact</h2>
        <p>
          Unimpossible Consultants Limited<br />
          United Kingdom<br />
          <a href="mailto:david@candengo.com">david@candengo.com</a>
        </p>
      </div>
    </div>
  );
}

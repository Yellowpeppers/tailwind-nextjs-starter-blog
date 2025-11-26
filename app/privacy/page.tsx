import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Privacy Policy' })

const lastUpdated = 'November 25, 2025'

export default function PrivacyPage() {
  return (
    <section className="py-12">
      <article className="prose prose-neutral dark:prose-invert mx-auto">
        <h1>Privacy Policy</h1>
        <p>Last updated: {lastUpdated}</p>
        <p>
          NeuroHacks Lab (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates digital
          tools, educational content, and related services focused on neurodivergent-friendly
          workflows. This Privacy Policy explains how we collect, use, and protect your information
          when you visit our website, access interactive tools, or subscribe to our resources.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>
            <strong>Email Addresses.</strong> When you subscribe to our mailing list or download a
            toolkit, we collect your email address to deliver the requested resources.
          </li>
          <li>
            <strong>Usage Data.</strong> Through Google Analytics 4 (GA4), we collect anonymized
            information about how you browse our site (pages visited, approximate location, device
            type, time-on-page) to understand engagement trends.
          </li>
          <li>
            <strong>Technical Data.</strong> Cookies and similar technologies store preferences,
            authentication status, and measurement data necessary to keep the site secure and
            responsive.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Deliver checklists, guides, and email sequences you specifically request.</li>
          <li>
            Analyze anonymized usage data to improve site performance and prioritize new tools.
          </li>
          <li>Maintain the safety, security, and reliability of our infrastructure.</li>
          <li>Respond to questions or feedback you send to our team.</li>
        </ul>

        <h2>Cookies &amp; Analytics</h2>
        <p>
          We rely on first-party cookies and GA4 analytics cookies to understand aggregate behavior.
          You can control cookie preferences through your browser settings or opt out of GA4 via the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
            Google Analytics Opt-out Browser Add-on
          </a>
          . Disabling cookies may limit some functionality (for example, saving quiz progress).
        </p>

        <h2>Data Security</h2>
        <p>
          We use SSL encryption, access controls, and vendor-level safeguards to protect the data we
          store. While no online service can guarantee absolute security, we review access logs and
          tooling regularly to reduce risk and respond quickly if an issue occurs.
        </p>

        <h2>Retention &amp; Your Choices</h2>
        <p>
          Email data is retained until you unsubscribe or request deletion. Analytics data is
          retained in GA4 according to Google&rsquo;s configurable retention windows. You may opt
          out of emails at any time via the unsubscribe link in each message or by contacting us
          directly.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or wish to exercise any data rights, email
          us at <a href="mailto:contact@neurohackslab.com">contact@neurohackslab.com</a>.
        </p>
      </article>
    </section>
  )
}

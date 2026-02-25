import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | mydscvr.ai",
  description:
    "Cookie Policy explaining how mydscvr.ai uses cookies and similar technologies — AI-powered Dubai school and nursery finder.",
};

export const dynamic = "force-dynamic";

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl">
        <h1>Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> 1 March 2025
          <br />
          <strong>Last Updated:</strong> 25 February 2026
          <br />
          <strong>Version:</strong> 1.1
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 1. INTRODUCTION */}
        {/* ---------------------------------------------------------------- */}
        <h2>1. Introduction</h2>
        <p>
          This Cookie Policy explains how <strong>Jasmine Entertainment FZE</strong>{" "}
          (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) uses cookies and similar technologies on the{" "}
          <strong>mydscvr.ai</strong> platform (the &ldquo;Platform&rdquo;),
          accessible at{" "}
          <a href="https://mydscvr.ai" target="_blank" rel="noopener noreferrer">
            https://mydscvr.ai
          </a>
          .
        </p>
        <p>
          This Cookie Policy should be read together with our{" "}
          <a href="/privacy">Privacy Policy</a> and{" "}
          <a href="/terms">Terms of Service</a>, which provide further
          information about how we collect and process your data.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 2. WHAT ARE COOKIES */}
        {/* ---------------------------------------------------------------- */}
        <h2>2. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device (computer,
          tablet, or mobile phone) when you visit a website. They are widely used
          to make websites work more efficiently, provide a better user
          experience, and supply information to website operators.
        </p>
        <p>Cookies can be categorized by their lifespan and origin:</p>
        <ul>
          <li>
            <strong>Session Cookies:</strong> Temporary cookies that are deleted
            when you close your browser. They are used to maintain your session
            while navigating the Platform.
          </li>
          <li>
            <strong>Persistent Cookies:</strong> Cookies that remain on your
            device for a set period or until you manually delete them. They are
            used to remember your preferences across visits.
          </li>
          <li>
            <strong>First-Party Cookies:</strong> Set by the website you are
            visiting (mydscvr.ai).
          </li>
          <li>
            <strong>Third-Party Cookies:</strong> Set by a domain other than the
            website you are visiting (e.g., by our service providers).
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 3. HOW WE USE COOKIES */}
        {/* ---------------------------------------------------------------- */}
        <h2>3. How We Use Cookies</h2>
        <p>
          We use cookies and similar technologies for the following purposes:
        </p>
        <ul>
          <li>
            <strong>Authentication:</strong> To identify you when you sign in and
            maintain your authenticated session;
          </li>
          <li>
            <strong>Security:</strong> To protect against fraudulent activity,
            bot traffic, and unauthorized access;
          </li>
          <li>
            <strong>Functionality:</strong> To enable core Platform features such
            as map rendering and user preferences;
          </li>
          <li>
            <strong>Performance:</strong> To ensure the Platform loads
            efficiently and operates smoothly.
          </li>
        </ul>
        <p>
          <strong>
            We do not use cookies for advertising, behavioral tracking, or
            cross-site profiling.
          </strong>
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 4. COOKIES WE USE */}
        {/* ---------------------------------------------------------------- */}
        <h2>4. Cookies We Use</h2>

        <h3>4.1 Essential Cookies (Strictly Necessary)</h3>
        <p>
          These cookies are required for the Platform to function and cannot be
          disabled. Without them, core features such as user authentication will
          not work.
        </p>
        <table>
          <thead>
            <tr>
              <th>Cookie Name</th>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>__session</code></td>
              <td>Clerk</td>
              <td>Maintains your authenticated user session</td>
              <td>Session</td>
            </tr>
            <tr>
              <td><code>__clerk_db_jwt</code></td>
              <td>Clerk</td>
              <td>JSON Web Token for secure authentication</td>
              <td>Session</td>
            </tr>
            <tr>
              <td><code>__client_uat</code></td>
              <td>Clerk</td>
              <td>Client-side authentication state tracking</td>
              <td>1 year</td>
            </tr>
            <tr>
              <td><code>__client</code></td>
              <td>Clerk</td>
              <td>Client identification for authentication flow</td>
              <td>1 year</td>
            </tr>
          </tbody>
        </table>

        <h3>4.2 Functional Cookies</h3>
        <p>
          These cookies enable enhanced functionality and personalization. While
          not strictly necessary, disabling them may affect your experience.
        </p>
        <table>
          <thead>
            <tr>
              <th>Cookie Name</th>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>mapbox.eventData.*</code></td>
              <td>Mapbox</td>
              <td>Map usage telemetry and tile cache optimization</td>
              <td>Persistent</td>
            </tr>
            <tr>
              <td><code>mapbox-gl-*</code></td>
              <td>Mapbox</td>
              <td>Map rendering preferences and WebGL state</td>
              <td>Session</td>
            </tr>
          </tbody>
        </table>

        <h3>4.3 Third-Party Cookies</h3>
        <p>
          Certain third-party services embedded in the Platform may set their own
          cookies. We have limited control over these cookies.
        </p>
        <table>
          <thead>
            <tr>
              <th>Cookie Name</th>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>NID</code>, <code>CONSENT</code></td>
              <td>Google Maps</td>
              <td>Google Maps embed functionality, user preferences, and consent tracking</td>
              <td>6 months</td>
            </tr>
            <tr>
              <td><code>__cf_bm</code></td>
              <td>Cloudflare</td>
              <td>Bot management and DDoS protection</td>
              <td>30 minutes</td>
            </tr>
            <tr>
              <td><code>_cf_*</code></td>
              <td>Cloudflare</td>
              <td>Security challenge tokens and CDN performance</td>
              <td>Varies</td>
            </tr>
          </tbody>
        </table>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 5. SIMILAR TECHNOLOGIES */}
        {/* ---------------------------------------------------------------- */}
        <h2>5. Similar Technologies</h2>
        <p>
          In addition to cookies, we use the following browser storage
          technologies:
        </p>

        <h3>5.1 SessionStorage</h3>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>User location data</td>
              <td>
                Caches your browser geolocation (latitude/longitude) for
                distance-based school sorting. Data is{" "}
                <strong>not sent to our servers</strong>.
              </td>
              <td>Cleared when you close the browser tab</td>
            </tr>
          </tbody>
        </table>

        <h3>5.2 LocalStorage</h3>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mapbox GL data</td>
              <td>Map tile caching and WebGL rendering state</td>
              <td>Until manually cleared</td>
            </tr>
            <tr>
              <td>Clerk auth state</td>
              <td>Client-side authentication synchronization</td>
              <td>Until manually cleared or logout</td>
            </tr>
          </tbody>
        </table>

        <h3>5.3 In-Memory Cache (Client-Side)</h3>
        <p>
          React Query maintains an in-memory cache of API responses (such as
          saved schools and search results) to improve performance. This cache
          exists only in your browser&rsquo;s memory and is cleared when you
          close or refresh the page. It is not a cookie and is not persisted.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 6. MANAGING COOKIES */}
        {/* ---------------------------------------------------------------- */}
        <h2>6. Managing Cookies</h2>

        <h3>6.1 Browser Settings</h3>
        <p>
          Most web browsers allow you to control cookies through their settings.
          You can typically:
        </p>
        <ul>
          <li>View the cookies stored on your device;</li>
          <li>Delete all or specific cookies;</li>
          <li>Block all cookies or only third-party cookies;</li>
          <li>Set your browser to notify you when a cookie is being set.</li>
        </ul>
        <p>
          Instructions for managing cookies in common browsers:
        </p>
        <ul>
          <li>
            <strong>Google Chrome:</strong> Settings &rarr; Privacy and Security
            &rarr; Cookies and other site data
          </li>
          <li>
            <strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp;
            Security &rarr; Cookies and Site Data
          </li>
          <li>
            <strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr;
            Manage Website Data
          </li>
          <li>
            <strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site
            permissions &rarr; Cookies and site data
          </li>
        </ul>

        <h3>6.2 Essential Cookies</h3>
        <p>
          Please note that if you disable essential cookies (particularly Clerk
          authentication cookies), you will not be able to sign in to the
          Platform or use authenticated features such as saved schools,
          dashboard, and enquiry tracking.
        </p>

        <h3>6.3 Third-Party Cookie Controls</h3>
        <p>
          For cookies set by third-party services, you may also manage your
          preferences through those providers:
        </p>
        <ul>
          <li>
            <strong>Google:</strong>{" "}
            <a
              href="https://policies.google.com/technologies/cookies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cookie Policy
            </a>
          </li>
          <li>
            <strong>Cloudflare:</strong>{" "}
            <a
              href="https://www.cloudflare.com/cookie-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudflare Cookie Policy
            </a>
          </li>
          <li>
            <strong>Mapbox:</strong>{" "}
            <a
              href="https://www.mapbox.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mapbox Privacy Policy
            </a>
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 7. COOKIES AND PERSONAL DATA */}
        {/* ---------------------------------------------------------------- */}
        <h2>7. Cookies and Personal Data</h2>
        <p>
          Some cookies may collect information that constitutes personal data
          (such as authentication tokens that identify your account). The
          collection and processing of such data through cookies is governed by
          our <a href="/privacy">Privacy Policy</a>.
        </p>
        <p>
          Where cookies process personal data, we rely on the following legal
          bases under the UAE PDPL:
        </p>
        <ul>
          <li>
            <strong>Essential cookies:</strong> Contractual necessity (required
            for the Platform to function as agreed in the Terms of Service);
          </li>
          <li>
            <strong>Functional cookies:</strong> Legitimate interests (providing
            enhanced functionality while respecting your data rights);
          </li>
          <li>
            <strong>Third-party cookies:</strong> Legitimate interests and, where
            applicable, your consent.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 8. UPDATES TO THIS POLICY */}
        {/* ---------------------------------------------------------------- */}
        <h2>8. Updates to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes
          in our technology, legal requirements, or the cookies we use. When we
          make changes:
        </p>
        <ul>
          <li>
            We will update the &ldquo;Last Updated&rdquo; date at the top of
            this Policy;
          </li>
          <li>
            For material changes, we will provide notice to registered users;
          </li>
          <li>
            Your continued use of the Platform after updates constitutes your
            acceptance of the revised Policy.
          </li>
        </ul>
        <p>
          We recommend that you review this Cookie Policy periodically for any
          changes.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 9. CONTACT INFORMATION */}
        {/* ---------------------------------------------------------------- */}
        <h2>9. Contact Information</h2>
        <p>
          If you have any questions about our use of cookies or this Cookie
          Policy, please contact us:
        </p>
        <ul>
          <li>
            <strong>Company:</strong> Jasmine Entertainment FZE
          </li>
          <li>
            <strong>Address:</strong> Publishing City, Sharjah, United Arab
            Emirates
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a>
          </li>
          <li>
            <strong>Privacy Enquiries:</strong>{" "}
            <a href="mailto:privacy@mydscvr.ai">privacy@mydscvr.ai</a>
          </li>
          <li>
            <strong>Website:</strong>{" "}
            <a href="https://mydscvr.ai" target="_blank" rel="noopener noreferrer">
              https://mydscvr.ai
            </a>
          </li>
        </ul>

        <hr />

        <p className="text-sm text-muted-foreground">
          This Cookie Policy was last updated on 25 February 2026. By continuing
          to use the Platform, you acknowledge that you have read and understood
          this Cookie Policy.
        </p>
      </article>
    </div>
  );
}

import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | mydscvr.ai",
  description:
    "Privacy Policy governing how mydscvr.ai collects, uses, and protects your personal data — AI-powered Dubai school and nursery finder.",
};

export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="How mydscvr.ai collects, uses, stores, and protects your personal data in compliance with UAE data protection regulations."
      effectiveDate="1 March 2025"
      lastUpdated="25 February 2026"
      version="1.1"
    >
        {/* ---------------------------------------------------------------- */}
        {/* 1. INTRODUCTION */}
        {/* ---------------------------------------------------------------- */}
        <h2>1. Introduction</h2>

        <h3>1.1 Overview</h3>
        <p>
          <strong>Jasmine Entertainment FZE</strong> (&ldquo;Company&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a free zone
          establishment registered in Sharjah, United Arab Emirates, with its
          registered office at Publishing City, Sharjah, UAE, operates the{" "}
          <strong>mydscvr.ai</strong> platform (the &ldquo;Platform&rdquo;,
          &ldquo;Service&rdquo;, &ldquo;Website&rdquo;), accessible at{" "}
          <a href="https://mydscvr.ai" target="_blank" rel="noopener noreferrer">
            https://mydscvr.ai
          </a>
          .
        </p>
        <p>
          This Privacy Policy (&ldquo;Policy&rdquo;) explains how we collect,
          use, disclose, store, and protect your personal data when you access or
          use our Platform. It applies to all visitors, users, and others who
          access the Service.
        </p>

        <h3>1.2 Acceptance</h3>
        <p>
          By accessing or using the Platform, you acknowledge that you have read,
          understood, and consent to the practices described in this Privacy
          Policy. If you do not agree with this Policy, you must immediately
          cease all use of the Platform.
        </p>

        <h3>1.3 Scope</h3>
        <p>
          This Policy applies to personal data collected through the Platform.
          It does not apply to third-party websites, services, or applications
          linked from the Platform, each of which is governed by its own privacy
          policy. We encourage you to read the privacy policies of any
          third-party services you interact with through our Platform.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 2. INFORMATION WE COLLECT */}
        {/* ---------------------------------------------------------------- */}
        <h2>2. Information We Collect</h2>

        <h3>2.1 Information You Provide Directly</h3>
        <p>We collect information that you voluntarily provide when using the Platform:</p>
        <ul>
          <li>
            <strong>Account Registration Data:</strong> When you create an
            account via our authentication provider (Clerk), we collect your
            name, email address, and profile photo. You may also sign up using
            third-party social login providers (e.g., Google), in which case we
            receive the profile information you have authorized that provider to
            share.
          </li>
          <li>
            <strong>User Preferences:</strong> Preferred school curricula,
            preferred geographical areas, and budget range that you configure in
            your profile settings.
          </li>
          <li>
            <strong>Enquiry Data:</strong> When you submit an enquiry about a
            school or nursery, we collect your name, email address, phone number,
            child&rsquo;s name, child&rsquo;s age or grade level, and any
            message you include.
          </li>
          <li>
            <strong>Search Queries:</strong> The text of searches you perform on
            the Platform, including AI-powered natural language search queries.
          </li>
          <li>
            <strong>AI Chat Interactions:</strong> Conversations you have with
            our AI chat assistant, including questions asked and preferences
            expressed.
          </li>
          <li>
            <strong>School Comparison Requests:</strong> Schools you select for
            side-by-side comparison.
          </li>
          <li>
            <strong>Saved Schools:</strong> Schools and nurseries you save or
            shortlist on the Platform.
          </li>
          <li>
            <strong>School Claim Requests:</strong> If you are a school
            representative, information you provide when claiming a school
            profile.
          </li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <p>
          When you access or use the Platform, we automatically collect certain
          information:
        </p>
        <ul>
          <li>
            <strong>Device and Browser Information:</strong> Browser type and
            version, operating system, device type, screen resolution, and
            language preferences.
          </li>
          <li>
            <strong>Usage Data:</strong> Pages visited, features used, time spent
            on pages, click patterns, and navigation paths.
          </li>
          <li>
            <strong>IP Address:</strong> Your Internet Protocol address,
            collected for rate limiting on AI-powered routes. IP addresses are
            processed in-memory for rate limiting and are{" "}
            <strong>not persisted</strong> to our database.
          </li>
          <li>
            <strong>Cookies and Similar Technologies:</strong> As described in
            our <a href="/cookies">Cookie Policy</a>, we use essential cookies
            for authentication and platform functionality.
          </li>
        </ul>

        <h3>2.3 Location Data</h3>
        <p>
          If you grant permission through your browser, we may access your
          approximate geographic location (latitude and longitude) to provide
          distance-based school sorting and map features. Location data is:
        </p>
        <ul>
          <li>Collected only with your explicit browser permission;</li>
          <li>
            Cached temporarily in your browser&rsquo;s sessionStorage (cleared
            when you close the browser tab);
          </li>
          <li>
            <strong>Not transmitted to or stored on our servers.</strong>
          </li>
        </ul>
        <p>
          You may revoke location access at any time through your browser
          settings or by using the clear location option in the Platform.
        </p>

        <h3>2.4 Information from Third Parties</h3>
        <p>
          We receive certain information from third-party services that power
          Platform features:
        </p>
        <ul>
          <li>
            <strong>Clerk (Authentication):</strong> Account authentication
            status, session tokens, and profile data you have stored with Clerk.
          </li>
          <li>
            <strong>Google Places API:</strong> School locations, ratings,
            reviews, photos, and contact information displayed on school
            profiles. These are publicly available data about educational
            institutions.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 3. HOW WE USE YOUR INFORMATION */}
        {/* ---------------------------------------------------------------- */}
        <h2>3. How We Use Your Information</h2>

        <h3>3.1 Service Provision</h3>
        <p>We use your personal data to:</p>
        <ul>
          <li>Create and manage your user account;</li>
          <li>
            Provide AI-powered school search, comparison, and recommendation
            features;
          </li>
          <li>
            Process and forward your enquiries to the relevant schools or
            nurseries;
          </li>
          <li>
            Save your preferences, shortlists, and search history for your
            dashboard;
          </li>
          <li>
            Display distance information based on your voluntarily provided
            location;
          </li>
          <li>
            Send you transactional emails, including enquiry confirmations and
            enquiry status notifications;
          </li>
          <li>
            Personalize search results based on your stated preferences
            (curricula, areas, budget).
          </li>
        </ul>

        <h3>3.2 AI Processing</h3>
        <p>
          Your search queries and chat messages are processed by artificial
          intelligence systems to:
        </p>
        <ul>
          <li>Extract search intent and match you with relevant schools;</li>
          <li>
            Generate natural language explanations of why schools match your
            criteria;
          </li>
          <li>Provide conversational assistance through the AI chat widget;</li>
          <li>
            Create side-by-side school comparisons with AI-generated analysis.
          </li>
        </ul>
        <p>
          AI processing is performed by third-party providers (Anthropic/Claude
          and OpenAI) as described in Section 5. Your queries are sent to these
          providers for processing but are not used by us or these providers to
          train AI models.
        </p>

        <h3>3.3 Platform Improvement</h3>
        <p>We may use aggregated, anonymized data to:</p>
        <ul>
          <li>
            Analyze usage patterns and improve Platform features and
            performance;
          </li>
          <li>Monitor and prevent abuse, fraud, and security threats;</li>
          <li>Enforce rate limits on AI-powered features;</li>
          <li>
            Debug technical issues and ensure Platform stability.
          </li>
        </ul>

        <h3>3.4 Communications</h3>
        <p>We may use your contact information to:</p>
        <ul>
          <li>
            Send enquiry confirmation emails and school response notifications;
          </li>
          <li>
            Send reminders when schools have not responded to your enquiries
            (based on your notification preferences);
          </li>
          <li>
            Notify you of material changes to these policies or the Terms of
            Service;
          </li>
          <li>
            Respond to your support requests sent to{" "}
            <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a>.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 4. LEGAL BASIS FOR PROCESSING */}
        {/* ---------------------------------------------------------------- */}
        <h2>4. Legal Basis for Processing</h2>
        <p>
          In accordance with UAE Federal Decree-Law No. 45 of 2021 on the
          Protection of Personal Data (&ldquo;PDPL&rdquo;) and applicable data
          protection regulations, we process your personal data on the following
          legal bases:
        </p>
        <ul>
          <li>
            <strong>Consent:</strong> You provide consent when you create an
            account, submit an enquiry, enable location services, or interact
            with AI features. You may withdraw consent at any time, though this
            may affect your ability to use certain Platform features.
          </li>
          <li>
            <strong>Contractual Necessity:</strong> Processing necessary to
            perform our obligations under the{" "}
            <a href="/terms">Terms of Service</a>, including providing the
            Platform&rsquo;s core features.
          </li>
          <li>
            <strong>Legitimate Interests:</strong> Processing necessary for our
            legitimate interests, including Platform security, fraud prevention,
            service improvement, and rate limiting, where such interests are not
            overridden by your data protection rights.
          </li>
          <li>
            <strong>Legal Obligation:</strong> Processing necessary to comply
            with applicable laws and regulations in the UAE.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 5. DATA SHARING AND THIRD-PARTY SERVICES */}
        {/* ---------------------------------------------------------------- */}
        <h2>5. Data Sharing and Third-Party Service Providers</h2>

        <h3>5.1 School Enquiries</h3>
        <p>
          When you submit an enquiry about a school or nursery, we share the
          following information with that educational institution:
        </p>
        <ul>
          <li>Your name, email address, and phone number;</li>
          <li>Your child&rsquo;s name and age/grade level;</li>
          <li>Your enquiry message.</li>
        </ul>
        <p>
          By submitting an enquiry, you expressly consent to this data sharing.
          Once your data is shared with a school, that school&rsquo;s own
          privacy practices govern their use of your information. We are not
          responsible for how schools handle your data after it has been shared.
        </p>

        <h3>5.2 Third-Party Service Providers</h3>
        <p>
          We use the following third-party service providers to operate the
          Platform. Each processes data in accordance with their own privacy
          policies:
        </p>

        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Data Processed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>User authentication and session management</td>
              <td>Name, email, profile photo, session tokens</td>
            </tr>
            <tr>
              <td><strong>Anthropic (Claude)</strong></td>
              <td>AI search intent extraction, chat, comparisons, summaries</td>
              <td>Search queries, chat messages, comparison requests</td>
            </tr>
            <tr>
              <td><strong>OpenAI</strong></td>
              <td>Text embeddings for semantic search</td>
              <td>School data text for embedding generation</td>
            </tr>
            <tr>
              <td><strong>Mapbox</strong></td>
              <td>Map rendering and geocoding</td>
              <td>School coordinates, map interaction data</td>
            </tr>
            <tr>
              <td><strong>Google Maps / Places</strong></td>
              <td>Map embeds, school location data, ratings, reviews</td>
              <td>School coordinates, browser interaction data</td>
            </tr>
            <tr>
              <td><strong>Resend</strong></td>
              <td>Transactional email delivery</td>
              <td>Email addresses, enquiry details, notification content</td>
            </tr>
            <tr>
              <td><strong>Exa.ai</strong></td>
              <td>School news, insights, and fee discovery</td>
              <td>School names and search queries (no personal data)</td>
            </tr>
            <tr>
              <td><strong>Upstash Redis</strong></td>
              <td>Server-side response caching</td>
              <td>Cached API responses (no personal data stored)</td>
            </tr>
            <tr>
              <td><strong>Railway</strong></td>
              <td>Hosting infrastructure (application and database)</td>
              <td>All platform data (as infrastructure provider)</td>
            </tr>
            <tr>
              <td><strong>Cloudflare</strong></td>
              <td>Content delivery network and DDoS protection</td>
              <td>IP addresses, request metadata</td>
            </tr>
          </tbody>
        </table>

        <h3>5.3 Data We Do Not Share</h3>
        <p>We do not:</p>
        <ul>
          <li>Sell your personal data to third parties;</li>
          <li>Share your data with advertisers or ad networks;</li>
          <li>
            Use your data for targeted advertising or marketing profiling;
          </li>
          <li>
            Provide your personal data to third parties for their own marketing
            purposes.
          </li>
        </ul>

        <h3>5.4 Legal Disclosures</h3>
        <p>
          We may disclose your personal data if required to do so by law, court
          order, or governmental request, or if we believe in good faith that
          such disclosure is necessary to:
        </p>
        <ul>
          <li>Comply with applicable laws or regulations in the UAE;</li>
          <li>Protect the rights, property, or safety of the Company, our users, or the public;</li>
          <li>Enforce our Terms of Service;</li>
          <li>Detect, prevent, or address fraud, security, or technical issues.</li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 6. INTERNATIONAL DATA TRANSFERS */}
        {/* ---------------------------------------------------------------- */}
        <h2>6. International Data Transfers</h2>
        <p>
          Our Platform is hosted on Railway infrastructure, and we use
          third-party service providers that may process data outside the United
          Arab Emirates. By using the Platform, you acknowledge and consent to
          the transfer of your data to countries that may have different data
          protection standards than the UAE.
        </p>
        <p>
          Where personal data is transferred internationally, we ensure that
          appropriate safeguards are in place in accordance with the UAE PDPL,
          including:
        </p>
        <ul>
          <li>
            Using service providers that maintain industry-standard security
            practices;
          </li>
          <li>
            Ensuring that data processing agreements are in place with key
            service providers;
          </li>
          <li>
            Limiting the personal data transferred to what is necessary for the
            service provision.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 7. DATA RETENTION */}
        {/* ---------------------------------------------------------------- */}
        <h2>7. Data Retention</h2>

        <h3>7.1 Retention Periods</h3>
        <p>We retain your personal data for the following periods:</p>
        <table>
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account data</td>
              <td>Duration of your account plus 30 days after deletion</td>
            </tr>
            <tr>
              <td>User preferences</td>
              <td>Duration of your account</td>
            </tr>
            <tr>
              <td>Saved schools</td>
              <td>Duration of your account</td>
            </tr>
            <tr>
              <td>Enquiry data</td>
              <td>24 months from submission (for reference and dispute resolution)</td>
            </tr>
            <tr>
              <td>Search history</td>
              <td>12 months (for dashboard display and personalization)</td>
            </tr>
            <tr>
              <td>AI chat conversations</td>
              <td>Duration of browser session (not persisted server-side)</td>
            </tr>
            <tr>
              <td>Location data</td>
              <td>Duration of browser session (sessionStorage only)</td>
            </tr>
            <tr>
              <td>IP addresses (rate limiting)</td>
              <td>In-memory only; cleared on server restart</td>
            </tr>
            <tr>
              <td>Notification data</td>
              <td>12 months</td>
            </tr>
          </tbody>
        </table>

        <h3>7.2 Deletion</h3>
        <p>
          When retention periods expire, personal data is deleted or anonymized.
          Aggregated, anonymized data that cannot identify you may be retained
          indefinitely for analytical purposes.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 8. DATA SECURITY */}
        {/* ---------------------------------------------------------------- */}
        <h2>8. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction, including:
        </p>
        <ul>
          <li>
            <strong>Encryption in Transit:</strong> All data transmitted between
            your browser and our servers is encrypted using TLS/SSL (HTTPS).
          </li>
          <li>
            <strong>Secure Authentication:</strong> User authentication is
            managed by Clerk, an industry-leading authentication provider, with
            secure session management.
          </li>
          <li>
            <strong>Database Security:</strong> Our PostgreSQL database is hosted
            on Railway with encrypted connections and restricted network access.
          </li>
          <li>
            <strong>Parameterized Queries:</strong> All database queries use
            parameterized inputs to prevent SQL injection attacks.
          </li>
          <li>
            <strong>Rate Limiting:</strong> AI-powered endpoints are
            rate-limited to prevent abuse.
          </li>
          <li>
            <strong>Access Controls:</strong> Administrative routes are protected
            by role-based authentication.
          </li>
          <li>
            <strong>CDN Protection:</strong> Cloudflare provides DDoS protection
            and Web Application Firewall capabilities.
          </li>
        </ul>
        <p>
          While we strive to use commercially acceptable means to protect your
          personal data, no method of transmission over the Internet or method of
          electronic storage is 100% secure. We cannot guarantee absolute
          security of your data.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 9. YOUR RIGHTS */}
        {/* ---------------------------------------------------------------- */}
        <h2>9. Your Rights</h2>
        <p>
          Under the UAE PDPL and applicable data protection regulations, you
          have the following rights regarding your personal data:
        </p>

        <h3>9.1 Right of Access</h3>
        <p>
          You have the right to request confirmation of whether we process your
          personal data and to obtain a copy of such data. You can access most
          of your data directly through your account dashboard, profile settings,
          and saved schools page.
        </p>

        <h3>9.2 Right to Rectification</h3>
        <p>
          You have the right to request correction of inaccurate personal data.
          You can update your profile information and preferences directly
          through the Platform at any time.
        </p>

        <h3>9.3 Right to Erasure</h3>
        <p>
          You have the right to request deletion of your personal data, subject
          to certain exceptions (e.g., legal obligations, legitimate interests).
          To request account deletion, contact us at{" "}
          <a href="mailto:privacy@mydscvr.ai">privacy@mydscvr.ai</a>.
        </p>

        <h3>9.4 Right to Restrict Processing</h3>
        <p>
          You have the right to request restriction of processing of your
          personal data in certain circumstances, such as when you contest the
          accuracy of the data or object to processing.
        </p>

        <h3>9.5 Right to Data Portability</h3>
        <p>
          You have the right to receive your personal data in a structured,
          commonly used, machine-readable format. Contact us at{" "}
          <a href="mailto:privacy@mydscvr.ai">privacy@mydscvr.ai</a> to request
          a data export.
        </p>

        <h3>9.6 Right to Object</h3>
        <p>
          You have the right to object to processing of your personal data based
          on legitimate interests. Where you object, we will cease processing
          unless we demonstrate compelling legitimate grounds.
        </p>

        <h3>9.7 Right to Withdraw Consent</h3>
        <p>
          Where processing is based on your consent, you may withdraw that
          consent at any time. Withdrawal of consent does not affect the
          lawfulness of processing carried out before the withdrawal. You may
          withdraw consent by:
        </p>
        <ul>
          <li>Disabling location permissions in your browser;</li>
          <li>Adjusting notification preferences in your profile;</li>
          <li>Deleting your account;</li>
          <li>
            Contacting us at{" "}
            <a href="mailto:privacy@mydscvr.ai">privacy@mydscvr.ai</a>.
          </li>
        </ul>

        <h3>9.8 Exercising Your Rights</h3>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a href="mailto:privacy@mydscvr.ai">privacy@mydscvr.ai</a>. We will
          respond to your request within thirty (30) days. We may request
          verification of your identity before processing your request.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 10. CHILDREN'S PRIVACY */}
        {/* ---------------------------------------------------------------- */}
        <h2>10. Children&rsquo;s Privacy</h2>
        <p>
          The Platform is designed for parents, guardians, and educators
          researching educational institutions for children. The Platform is{" "}
          <strong>not directed at children under 18 years of age</strong>, and we
          do not knowingly collect personal data directly from children.
        </p>
        <p>
          When a parent submits an enquiry, they may provide their child&rsquo;s
          name and age/grade level. This information is:
        </p>
        <ul>
          <li>Provided by the parent or guardian, not by the child;</li>
          <li>Used solely to facilitate the school enquiry;</li>
          <li>Shared only with the specific school to which the enquiry is directed;</li>
          <li>Retained in accordance with our data retention schedule (Section 7).</li>
        </ul>
        <p>
          If we become aware that we have collected personal data directly from a
          child under 18 without verified parental consent, we will take steps to
          delete that information promptly.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 11. COOKIES AND SIMILAR TECHNOLOGIES */}
        {/* ---------------------------------------------------------------- */}
        <h2>11. Cookies and Similar Technologies</h2>
        <p>
          We use cookies and similar technologies to operate the Platform. For
          detailed information about the cookies we use, their purposes, and how
          to manage them, please refer to our{" "}
          <a href="/cookies">Cookie Policy</a>.
        </p>
        <p>Key points:</p>
        <ul>
          <li>
            We use <strong>essential cookies</strong> for authentication (via
            Clerk) and platform functionality;
          </li>
          <li>
            We use <strong>functional cookies</strong> for map services (Mapbox,
            Google Maps);
          </li>
          <li>
            We do <strong>not</strong> use advertising or tracking cookies;
          </li>
          <li>
            You can manage cookie preferences through your browser settings.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 12. AI-SPECIFIC DATA PRACTICES */}
        {/* ---------------------------------------------------------------- */}
        <h2>12. AI-Specific Data Practices</h2>

        <h3>12.1 AI Processing Transparency</h3>
        <p>
          The Platform uses artificial intelligence to power search, chat,
          comparison, and summary features. When you use these features:
        </p>
        <ul>
          <li>
            Your search queries are sent to Anthropic (Claude) for intent
            extraction and response generation;
          </li>
          <li>
            School data text is sent to OpenAI for embedding generation (used in
            semantic search);
          </li>
          <li>
            AI-generated content (search explanations, comparisons, summaries) is
            created in real-time and may vary between requests;
          </li>
          <li>
            We do not use your personal queries to train or fine-tune AI models.
          </li>
        </ul>

        <h3>12.2 Automated Decision-Making</h3>
        <p>
          The Platform uses automated processing to rank and recommend schools
          based on your search queries and preferences. This includes:
        </p>
        <ul>
          <li>Semantic similarity scoring between your query and school profiles;</li>
          <li>Preference-based ranking boosts for authenticated users;</li>
          <li>KHDA rating weighting in search results.</li>
        </ul>
        <p>
          These automated processes assist in presenting relevant results but do
          not make decisions that produce legal effects or similarly significant
          effects concerning you. All search results are presented as
          informational suggestions, and you retain full autonomy in your
          educational decisions.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 13. DATA BREACH NOTIFICATION */}
        {/* ---------------------------------------------------------------- */}
        <h2>13. Data Breach Notification</h2>
        <p>
          In the event of a personal data breach that is likely to result in a
          risk to your rights and freedoms, we will:
        </p>
        <ul>
          <li>
            Notify the relevant supervisory authority without undue delay and,
            where feasible, within seventy-two (72) hours of becoming aware of
            the breach;
          </li>
          <li>
            Notify affected individuals without undue delay where the breach is
            likely to result in a high risk to their rights and freedoms;
          </li>
          <li>
            Document the breach, its effects, and the remedial actions taken.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 14. DO NOT TRACK */}
        {/* ---------------------------------------------------------------- */}
        <h2>14. Do Not Track Signals</h2>
        <p>
          The Platform does not currently respond to &ldquo;Do Not Track&rdquo;
          (DNT) browser signals. However, as we do not engage in cross-site
          tracking or targeted advertising, the practical effect is equivalent to
          honoring DNT requests.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 15. CHANGES TO THIS POLICY */}
        {/* ---------------------------------------------------------------- */}
        <h2>15. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technologies, legal requirements, or other factors.
          When we make changes:
        </p>
        <ul>
          <li>
            We will update the &ldquo;Last Updated&rdquo; date at the top of
            this Policy;
          </li>
          <li>
            For material changes, we will provide notice to registered users via
            email at least fifteen (15) days before the changes take effect;
          </li>
          <li>
            Your continued use of the Platform after the effective date of any
            changes constitutes your acceptance of the revised Policy.
          </li>
        </ul>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 16. UAE REGULATORY COMPLIANCE */}
        {/* ---------------------------------------------------------------- */}
        <h2>16. UAE Regulatory Compliance</h2>

        <h3>16.1 UAE Personal Data Protection Law</h3>
        <p>
          This Privacy Policy is designed to comply with UAE Federal Decree-Law
          No. 45 of 2021 on the Protection of Personal Data (PDPL) and its
          implementing regulations. We are committed to upholding the data
          protection principles established by UAE law, including lawfulness,
          fairness, transparency, purpose limitation, data minimization,
          accuracy, storage limitation, integrity, and confidentiality.
        </p>

        <h3>16.2 Right to Lodge a Complaint</h3>
        <p>
          If you believe that our processing of your personal data violates
          applicable data protection laws, you have the right to lodge a
          complaint with the UAE Data Office or the relevant supervisory
          authority. We encourage you to contact us first at{" "}
          <a href="mailto:privacy@mydscvr.ai">privacy@mydscvr.ai</a> so that we
          may attempt to resolve your concern.
        </p>

        <h3>16.3 Sharjah Free Zone Compliance</h3>
        <p>
          As a free zone establishment registered in Sharjah, we comply with all
          applicable free zone regulations regarding data handling and business
          operations.
        </p>

        <hr />

        {/* ---------------------------------------------------------------- */}
        {/* 17. CONTACT INFORMATION */}
        {/* ---------------------------------------------------------------- */}
        <h2>17. Contact Information</h2>
        <p>
          If you have any questions, concerns, or requests regarding this
          Privacy Policy or our data practices, please contact us:
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
            <strong>General Support:</strong>{" "}
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
          This Privacy Policy was last updated on 25 February 2026. By
          continuing to use the Platform, you acknowledge that you have read and
          understood this Privacy Policy and consent to the collection, use, and
          disclosure of your information as described herein.
        </p>
    </LegalPageLayout>
  );
}

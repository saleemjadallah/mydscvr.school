import { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | mydscvr.ai",
  description:
    "Terms of Service governing your use of the mydscvr.ai platform — AI-powered Dubai school and nursery finder.",
};

export const dynamic = "force-dynamic";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="The rules and guidelines governing your use of the mydscvr.ai platform for discovering schools and nurseries in Dubai and the UAE."
      effectiveDate="1 March 2025"
      lastUpdated="25 February 2026"
      version="1.1"
    >
        {/* ---------------------------------------------------------------- */}
        {/* 1. INTRODUCTION AND ACCEPTANCE */}
        {/* ---------------------------------------------------------------- */}
        <h2>1. Introduction and Acceptance of Terms</h2>

        <h3>1.1 Agreement</h3>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;, &ldquo;Agreement&rdquo;)
          constitute a legally binding agreement between you
          (&ldquo;User&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo;) and{" "}
          <strong>Jasmine Entertainment FZE</strong>, a free zone establishment
          registered in Sharjah, United Arab Emirates, with its registered
          office at Publishing City, Sharjah, UAE (&ldquo;Company&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), governing
          your access to and use of the <strong>mydscvr.ai</strong> platform,
          available at{" "}
          <a href="https://mydscvr.ai" target="_blank" rel="noopener noreferrer">
            https://mydscvr.ai
          </a>{" "}
          (the &ldquo;Platform&rdquo;, &ldquo;Service&rdquo;,
          &ldquo;Website&rdquo;).
        </p>

        <h3>1.2 Acceptance</h3>
        <p>
          By accessing, browsing, or using the Platform in any manner, you
          acknowledge that you have read, understood, and agree to be bound by
          these Terms and our{" "}
          <a href="/privacy">Privacy Policy</a>, which is incorporated herein by
          reference. If you do not agree to these Terms, you must immediately
          cease all use of the Platform.
        </p>

        <h3>1.3 Capacity to Contract</h3>
        <p>
          By using the Platform, you represent and warrant that you are at least
          eighteen (18) years of age, or the age of legal majority in your
          jurisdiction (whichever is greater), and have the legal capacity to
          enter into this Agreement. If you are using the Platform on behalf of
          an organisation (including a school, nursery, or educational
          institution), you represent and warrant that you have the authority to
          bind that organisation to these Terms, and references to
          &ldquo;you&rdquo; shall include that organisation.
        </p>

        <h3>1.4 Minors</h3>
        <p>
          The Platform is intended for use by parents, guardians, and
          educational professionals. It is not directed at children under 18.
          Persons under 18 may not create accounts or submit enquiries. While
          the Platform contains information about schools and nurseries serving
          children, the Platform&rsquo;s users and account holders must be
          adults. If we become aware that a person under 18 has created an
          account, we will terminate it and delete the associated data.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 2. DESCRIPTION OF SERVICES */}
        {/* ---------------------------------------------------------------- */}
        <h2>2. Description of Services</h2>

        <h3>2.1 Platform Overview</h3>
        <p>
          mydscvr.ai is an AI-powered school and nursery finder platform that
          helps parents and guardians in Dubai and the broader UAE discover,
          compare, and enquire about educational institutions. The Platform
          aggregates publicly available information from multiple sources and
          uses artificial intelligence to assist users in their school search
          process.
        </p>

        <h3>2.2 Core Features</h3>
        <p>The Platform provides the following features:</p>
        <ol type="a">
          <li>
            <strong>AI-Powered Search:</strong> Natural language search
            functionality that uses artificial intelligence to understand your
            educational preferences and match you with relevant schools and
            nurseries. The AI extracts search intent, generates semantic
            embeddings, performs hybrid ranking, and produces explanatory
            summaries of results.
          </li>
          <li>
            <strong>School and Nursery Directory:</strong> A directory of
            educational institutions in Dubai and the UAE, featuring profiles
            with information such as curricula, fee ranges, KHDA inspection
            ratings, locations, facilities, and other details sourced from
            third-party data providers.
          </li>
          <li>
            <strong>AI-Powered Comparison:</strong> A tool enabling side-by-side
            comparison of schools and nurseries, with AI-generated analysis of
            relative strengths and considerations.
          </li>
          <li>
            <strong>AI Chat Assistant:</strong> A conversational, multi-turn AI
            search assistant accessible via a chat widget, providing
            interactive guidance in your school search process.
          </li>
          <li>
            <strong>Enquiry Submission:</strong> A system allowing parents to
            submit enquiries to schools through the Platform, with automated
            email notifications to both the parent and the school.
          </li>
          <li>
            <strong>User Accounts:</strong> Registered accounts enabling users
            to save and shortlist schools, set educational preferences
            (preferred curricula, areas, and budget range), track enquiry
            history, and receive notifications.
          </li>
          <li>
            <strong>School News and Insights:</strong> AI-curated news articles
            and insights related to individual schools and nurseries.
          </li>
          <li>
            <strong>Map Views:</strong> Interactive maps displaying school
            locations, powered by third-party mapping services.
          </li>
          <li>
            <strong>School Profile Claims:</strong> A process by which
            authorised representatives of schools may claim and verify their
            institution&rsquo;s profile on the Platform.
          </li>
        </ol>

        <h3>2.3 Free Service</h3>
        <p>
          The Platform is currently provided free of charge to parents and
          guardians. We reserve the right to introduce premium features, paid
          services, advertising, or subscription models in the future, which
          would be subject to additional terms and advance notice to users.
        </p>

        <h3>2.4 Service Availability</h3>
        <p>
          We endeavour to maintain the Platform&rsquo;s availability but do not
          guarantee uninterrupted or error-free operation. The Platform may be
          temporarily unavailable due to maintenance, updates, technical
          failures, or circumstances beyond our reasonable control. We reserve
          the right to modify, suspend, or discontinue any aspect of the Service
          at any time without prior notice.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 3. USER ACCOUNTS */}
        {/* ---------------------------------------------------------------- */}
        <h2>3. User Accounts and Registration</h2>

        <h3>3.1 Account Creation</h3>
        <p>
          Certain features of the Platform, including saving schools, setting
          preferences, submitting enquiries as a logged-in user, and accessing
          your dashboard, require you to create a user account. Account
          authentication is managed through our third-party authentication
          provider, Clerk. By creating an account, you agree to Clerk&rsquo;s
          terms of service in addition to these Terms.
        </p>

        <h3>3.2 Account Information</h3>
        <p>
          You agree to provide accurate, current, and complete information
          during the registration process and to keep your account information
          updated. You are responsible for maintaining the confidentiality of
          your account credentials and for all activities that occur under your
          account.
        </p>

        <h3>3.3 Account Security</h3>
        <p>
          You must immediately notify us at{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a> of any
          unauthorised access to or use of your account, or any other breach of
          security. We shall not be liable for any loss or damage arising from
          your failure to safeguard your account credentials.
        </p>

        <h3>3.4 One Account Per Person</h3>
        <p>
          Each individual may maintain only one active account on the Platform.
          We reserve the right to merge or terminate duplicate accounts.
        </p>

        <h3>3.5 Account Termination by User</h3>
        <p>
          You may deactivate your account at any time by contacting us at{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a>. Upon
          termination, your saved schools, preferences, and other account data
          will be deleted in accordance with our Privacy Policy, subject to any
          legal retention obligations.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 4. USER CONDUCT AND ACCEPTABLE USE */}
        {/* ---------------------------------------------------------------- */}
        <h2>4. User Conduct and Acceptable Use</h2>

        <h3>4.1 Permitted Use</h3>
        <p>
          You may use the Platform solely for lawful, personal,
          non-commercial purposes related to researching, comparing, and
          enquiring about schools and nurseries for your children or dependants,
          or for managing your educational institution&rsquo;s profile if you
          are an authorised school representative.
        </p>

        <h3>4.2 Prohibited Conduct</h3>
        <p>You agree not to:</p>
        <ol type="a">
          <li>
            Use the Platform for any unlawful purpose or in violation of any
            applicable local, national, or international law or regulation,
            including but not limited to UAE federal law, DIFC regulations, and
            data protection legislation;
          </li>
          <li>
            Submit false, misleading, or fraudulent information in enquiries,
            account registration, or any other interaction with the Platform;
          </li>
          <li>
            Impersonate any person or entity, or falsely state or misrepresent
            your affiliation with a person or entity, including claiming to be
            a school representative when you are not;
          </li>
          <li>
            Use automated scripts, bots, scrapers, crawlers, or other automated
            means to access, collect data from, or interact with the Platform,
            except as expressly authorised in writing by the Company or through
            publicly available APIs provided for that purpose;
          </li>
          <li>
            Attempt to circumvent rate limits, access controls, security
            measures, or any other technical restrictions on the Platform;
          </li>
          <li>
            Engage in any activity that interferes with or disrupts the
            Platform&rsquo;s operation, servers, networks, or infrastructure,
            including denial-of-service attacks, injection attacks, or
            exploitation of vulnerabilities;
          </li>
          <li>
            Reverse-engineer, decompile, disassemble, or otherwise attempt to
            derive the source code, algorithms, or data models of the Platform
            or its AI systems;
          </li>
          <li>
            Use the Platform to send unsolicited communications, spam, or
            promotional materials to schools or other users;
          </li>
          <li>
            Submit enquiries in bulk, submit enquiries to schools with no
            genuine interest in enrolment, or use the enquiry system for
            purposes other than legitimate school enquiries;
          </li>
          <li>
            Collect, harvest, or store personal information of other users or
            schools beyond what is displayed on the Platform for normal use;
          </li>
          <li>
            Post, upload, or transmit any content that is defamatory, obscene,
            threatening, harassing, discriminatory, or otherwise objectionable;
          </li>
          <li>
            Use the AI features to generate content that is harmful, illegal,
            misleading, or violates the rights of any third party;
          </li>
          <li>
            Attempt to manipulate AI outputs, search rankings, or school
            ratings through deceptive inputs or coordinated inauthentic
            behaviour;
          </li>
          <li>
            Reproduce, distribute, publicly display, or create derivative works
            from Platform content except as expressly permitted;
          </li>
          <li>
            Use the Platform in any manner that could damage, disable,
            overburden, or impair our servers or interfere with any other
            party&rsquo;s use of the Platform.
          </li>
        </ol>

        <h3>4.3 Rate Limiting and Fair Use</h3>
        <p>
          To ensure fair access and maintain platform stability, certain
          features are subject to rate limits. AI-powered search, comparison,
          and chat features have per-user request limits applied on a
          per-minute basis. These limits are designed to prevent abuse while
          accommodating normal usage patterns. Repeatedly exceeding rate limits
          or attempting to circumvent them may result in temporary or permanent
          suspension of your access to the affected features or your account
          entirely. Current rate limits are applied at our discretion and may
          be adjusted without prior notice.
        </p>

        <h3>4.4 Enforcement</h3>
        <p>
          We reserve the right, at our sole discretion, to investigate and take
          appropriate action against any user who violates these Terms,
          including but not limited to: issuing warnings; temporarily or
          permanently suspending account access; removing content; reporting
          violations to law enforcement; and pursuing legal remedies.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 5. AI-GENERATED CONTENT */}
        {/* ---------------------------------------------------------------- */}
        <h2>5. Artificial Intelligence Disclaimer</h2>

        <h3>5.1 AI-Generated Content</h3>
        <p>
          The Platform uses artificial intelligence and machine learning
          technologies, including large language models and embedding models
          provided by third-party AI providers, to generate search results,
          school summaries, comparisons, explanations, chat responses, insights,
          and other content (&ldquo;AI-Generated Content&rdquo;). You
          acknowledge and agree that:
        </p>
        <ol type="a">
          <li>
            AI-Generated Content is produced algorithmically and may contain
            inaccuracies, errors, omissions, outdated information, or
            misleading statements;
          </li>
          <li>
            AI-Generated Content is provided for informational and general
            guidance purposes only and does not constitute professional
            educational advice, a recommendation, or an endorsement of any
            school, nursery, or educational programme;
          </li>
          <li>
            You should independently verify all AI-Generated Content before
            making any educational decisions, including by contacting schools
            directly, visiting schools in person, reviewing official KHDA
            inspection reports, and consulting with educational professionals;
          </li>
          <li>
            AI models may produce different outputs for the same or similar
            inputs, and results are not guaranteed to be consistent,
            reproducible, or complete;
          </li>
          <li>
            The Company does not review, verify, or endorse AI-Generated
            Content before it is displayed to users, and shall not be liable
            for any reliance you place on such content;
          </li>
          <li>
            AI features may be updated, modified, or replaced at any time,
            which may affect the quality, nature, or availability of
            AI-Generated Content.
          </li>
        </ol>

        <h3>5.2 No Professional Advice</h3>
        <p>
          Nothing on the Platform, including AI-Generated Content, constitutes
          professional educational consulting, legal, financial, or child
          welfare advice. The Platform is a search and information tool, not a
          substitute for professional guidance. You are solely responsible for
          evaluating the suitability of any school or nursery for your child and
          for all enrolment decisions.
        </p>

        <h3>5.3 AI Interaction Transparency</h3>
        <p>
          When you use the AI search, comparison, or chat features, you are
          interacting with automated AI systems, not human advisors. AI
          responses are generated in real-time and are not pre-approved by
          educational experts. We strive to clearly indicate when content is
          AI-generated.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 6. SCHOOL INFORMATION ACCURACY */}
        {/* ---------------------------------------------------------------- */}
        <h2>6. School and Nursery Information</h2>

        <h3>6.1 Data Sources</h3>
        <p>
          School and nursery information displayed on the Platform is aggregated
          from multiple third-party sources, including but not limited to:
        </p>
        <ol type="a">
          <li>
            The Knowledge and Human Development Authority (KHDA) and its
            publicly available inspection data and open data portals;
          </li>
          <li>
            Dubai Pulse open data platform;
          </li>
          <li>
            Google Places API (ratings, reviews, location data, and
            photographs);
          </li>
          <li>
            School websites (via automated data extraction);
          </li>
          <li>
            Exa.ai neural web search (news, insights, and supplementary
            information);
          </li>
          <li>
            Other publicly available sources.
          </li>
        </ol>

        <h3>6.2 Information Accuracy Disclaimer</h3>
        <p>
          While we make reasonable efforts to maintain accurate and up-to-date
          information, you acknowledge and agree that:
        </p>
        <ol type="a">
          <li>
            School information, including but not limited to tuition fees,
            curricula, KHDA ratings, facilities, enrolment policies, contact
            details, and operating hours, may be outdated, incomplete,
            inaccurate, or may have changed since the information was last
            collected or updated;
          </li>
          <li>
            Fee information is indicative only and is subject to change by
            schools without notice. Displayed fee ranges are sourced from KHDA
            open data, school websites, and other publicly available sources,
            and may not reflect current actual fees, discounts, scholarships,
            sibling discounts, or additional charges;
          </li>
          <li>
            KHDA inspection ratings reflect the outcome of inspections
            conducted at a particular point in time and may not reflect a
            school&rsquo;s current performance;
          </li>
          <li>
            Reviews displayed on the Platform are sourced from Google Places
            and represent the views of third-party reviewers. We do not verify,
            moderate, or endorse reviews, and they may not be representative of
            the general parent experience;
          </li>
          <li>
            School photographs may be sourced from Google Places or school
            websites and may not accurately represent current facilities or
            conditions;
          </li>
          <li>
            We are not affiliated with, endorsed by, or acting as an agent of
            KHDA, any school, nursery, or any other educational authority,
            unless explicitly stated otherwise;
          </li>
          <li>
            You should always verify information directly with the school or
            nursery before making any enrolment or financial decisions.
          </li>
        </ol>

        <h3>6.3 No Endorsement</h3>
        <p>
          The listing of any school or nursery on the Platform does not
          constitute an endorsement, recommendation, or guarantee of quality by
          the Company. Search rankings and the order in which schools appear are
          determined by algorithmic factors including semantic relevance, KHDA
          ratings, user preferences, and other technical signals, and do not
          imply a qualitative judgement by the Company.
        </p>

        <h3>6.4 Schools&rsquo; Responsibility</h3>
        <p>
          Schools and nurseries listed on the Platform are independent entities.
          They are solely responsible for the accuracy of any information they
          provide, their admissions decisions, their fee structures, the
          quality of education they deliver, and their compliance with
          applicable laws and regulations.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 7. ENQUIRY SYSTEM */}
        {/* ---------------------------------------------------------------- */}
        <h2>7. Enquiry System</h2>

        <h3>7.1 Intermediary Role</h3>
        <p>
          The Platform provides an enquiry submission system that allows parents
          and guardians to express interest in a school or nursery. When you
          submit an enquiry, we act solely as an intermediary, transmitting your
          enquiry information to the relevant school via email. We are not a
          party to any relationship, agreement, or transaction between you and
          any school.
        </p>

        <h3>7.2 Enquiry Information</h3>
        <p>
          By submitting an enquiry, you consent to the following:
        </p>
        <ol type="a">
          <li>
            Your contact information (including name, email address, phone
            number) and child information (including name, age, grade level,
            current school, and any additional message) will be shared with the
            school or nursery to which you submit the enquiry;
          </li>
          <li>
            The school may contact you directly using the information you
            provide, and you may receive communications from the school
            independently of the Platform;
          </li>
          <li>
            A confirmation email will be sent to you acknowledging receipt of
            your enquiry, and a notification email will be sent to the school
            containing your enquiry details;
          </li>
          <li>
            Your enquiry data, including its status, will be stored on the
            Platform and accessible through your dashboard (if you have an
            account) for enquiry tracking purposes.
          </li>
        </ol>

        <h3>7.3 No Guarantee of Response</h3>
        <p>
          We do not guarantee that any school will respond to your enquiry, will
          respond within any specific timeframe, or will offer your child a
          place. We have no control over a school&rsquo;s admissions process,
          capacity, selection criteria, or response practices. While we may
          provide notification reminders when a school has not responded to your
          enquiry, we are not responsible for a school&rsquo;s failure to
          respond.
        </p>

        <h3>7.4 Accuracy of Enquiry Information</h3>
        <p>
          You represent and warrant that all information you provide in an
          enquiry is true, accurate, and submitted for a genuine interest in
          enrolment. Submitting false, fraudulent, or spam enquiries is a
          violation of these Terms and may result in account termination.
        </p>

        <h3>7.5 Data Retention</h3>
        <p>
          Enquiry data is retained in accordance with our Privacy Policy. Once
          shared with a school, the school&rsquo;s handling of your data is
          governed by that school&rsquo;s own privacy practices, and we are not
          responsible for their use, storage, or protection of your data.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 8. SCHOOL PROFILE CLAIMS */}
        {/* ---------------------------------------------------------------- */}
        <h2>8. School Profile Claims</h2>

        <h3>8.1 Claim Process</h3>
        <p>
          Authorised representatives of schools and nurseries listed on the
          Platform may submit a claim request to manage their institution&rsquo;s
          profile. Claim requests are subject to verification by the Company at
          our sole discretion.
        </p>

        <h3>8.2 Verification</h3>
        <p>
          We reserve the right to request documentation or other evidence to
          verify that the person submitting a claim is an authorised
          representative of the school. We may approve, deny, or request
          additional information for any claim at our discretion.
        </p>

        <h3>8.3 Claimed Profile Obligations</h3>
        <p>
          Schools that claim their profile agree to:
        </p>
        <ol type="a">
          <li>
            Provide accurate and up-to-date information about their institution;
          </li>
          <li>
            Promptly update their profile when information changes;
          </li>
          <li>
            Not use the profile for misleading advertising or misrepresentation;
          </li>
          <li>
            Comply with all applicable laws and regulations, including KHDA
            regulations, advertising standards, and data protection
            requirements.
          </li>
        </ol>

        <h3>8.4 Right to Remove or Modify</h3>
        <p>
          We reserve the right to modify, correct, or remove any information on
          a school profile, including information provided by a claimed
          school, if we reasonably believe it to be inaccurate, misleading, or
          in violation of these Terms.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 9. INTELLECTUAL PROPERTY */}
        {/* ---------------------------------------------------------------- */}
        <h2>9. Intellectual Property Rights</h2>

        <h3>9.1 Platform Content</h3>
        <p>
          The Platform and its original content (excluding third-party data and
          user content), features, functionality, design, look and feel,
          branding, logos, graphics, software code, AI models as implemented on
          the Platform, database compilation, and the selection and arrangement
          of content are the exclusive property of Jasmine Entertainment FZE
          and are protected by copyright, trademark, trade dress, database
          rights, and other intellectual property laws of the UAE and
          international treaties.
        </p>

        <h3>9.2 Third-Party Data</h3>
        <p>
          School data sourced from KHDA, Dubai Pulse, Google Places, and other
          third-party sources remains the property of those respective parties
          and is used on the Platform under applicable open data licences, API
          terms of service, or fair use principles. You may not extract,
          reproduce, or redistribute such data except as permitted by the
          original data provider&rsquo;s terms.
        </p>

        <h3>9.3 AI-Generated Content Ownership</h3>
        <p>
          AI-Generated Content produced by the Platform (including summaries,
          comparisons, and chat responses) is generated using third-party AI
          models. The Company claims no exclusive ownership of AI-Generated
          Content and makes no representations regarding intellectual property
          rights in such content. You may use AI-Generated Content for your
          personal, non-commercial purposes only. You may not reproduce,
          distribute, or commercially exploit AI-Generated Content without our
          prior written consent.
        </p>

        <h3>9.4 Trademarks</h3>
        <p>
          &ldquo;mydscvr.ai&rdquo;, &ldquo;Mydscvr&rdquo;, and related logos
          and trade names are trademarks or service marks of Jasmine
          Entertainment FZE. You may not use these marks without our prior
          written consent. All other trademarks, logos, and brand names
          appearing on the Platform (including school names and logos) are the
          property of their respective owners.
        </p>

        <h3>9.5 Limited Licence to Users</h3>
        <p>
          Subject to your compliance with these Terms, we grant you a limited,
          non-exclusive, non-transferable, non-sublicensable, revocable licence
          to access and use the Platform for your personal, non-commercial
          purposes. This licence does not include the right to:
        </p>
        <ol type="a">
          <li>
            Modify, copy, or create derivative works based on the Platform or
            its content;
          </li>
          <li>
            Use data mining, scraping, robots, or similar data-gathering tools
            on the Platform;
          </li>
          <li>
            Download (other than page caching) or copy any portion of the
            Platform for commercial purposes;
          </li>
          <li>
            Frame, mirror, or use framing techniques to enclose any portion of
            the Platform;
          </li>
          <li>
            Use the Platform&rsquo;s content outside of the Platform without
            express written permission.
          </li>
        </ol>

        <h3>9.6 Feedback</h3>
        <p>
          Any feedback, suggestions, ideas, or recommendations you provide to
          us regarding the Platform (&ldquo;Feedback&rdquo;) shall become our
          exclusive property. You hereby assign to us all rights, title, and
          interest in and to such Feedback, and we shall be free to use,
          disclose, reproduce, and commercialise such Feedback without
          restriction or compensation to you.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 10. PRIVACY AND DATA PROTECTION */}
        {/* ---------------------------------------------------------------- */}
        <h2>10. Privacy and Data Protection</h2>

        <h3>10.1 Privacy Policy</h3>
        <p>
          Your use of the Platform is also governed by our{" "}
          <a href="/privacy">Privacy Policy</a>, which describes how we
          collect, use, store, share, and protect your personal data. The
          Privacy Policy is incorporated into and forms part of these Terms. By
          using the Platform, you consent to the data practices described in
          the Privacy Policy.
        </p>

        <h3>10.2 Applicable Data Protection Law</h3>
        <p>
          We process personal data in accordance with the UAE Federal
          Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)
          and its implementing regulations. For users accessing the Platform
          from the European Economic Area, the United Kingdom, or other
          jurisdictions with data protection legislation, additional
          protections as described in our Privacy Policy may apply.
        </p>

        <h3>10.3 Cross-Border Data Transfers</h3>
        <p>
          By using the Platform, you acknowledge that your data may be
          transferred to, stored, and processed in jurisdictions outside the
          UAE, including the United States, by our third-party service providers
          (including authentication, AI, email, mapping, and caching services).
          Such transfers are conducted with appropriate safeguards as described
          in our Privacy Policy.
        </p>

        <h3>10.4 Children&rsquo;s Data</h3>
        <p>
          While the Platform deals with educational institutions serving
          children, we collect minimal data about children. Information about
          children provided through enquiry forms (such as child name, age, and
          grade) is collected from the parent or guardian and is shared only
          with the school to which the enquiry is directed. We do not collect
          data directly from children and do not knowingly market to children.
          Please refer to our Privacy Policy for further details.
        </p>

        <h3>10.5 Cookies</h3>
        <p>
          The Platform uses cookies and similar tracking technologies as
          described in our <a href="/cookies">Cookie Policy</a>. By continuing
          to use the Platform, you consent to our use of cookies in accordance
          with our Cookie Policy.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 11. THIRD-PARTY SERVICES AND LINKS */}
        {/* ---------------------------------------------------------------- */}
        <h2>11. Third-Party Services and Links</h2>

        <h3>11.1 Third-Party Service Providers</h3>
        <p>
          The Platform integrates with and relies upon third-party services to
          deliver its functionality, including but not limited to:
        </p>
        <ol type="a">
          <li>
            <strong>Clerk</strong> &mdash; user authentication and account
            management;
          </li>
          <li>
            <strong>Anthropic (Claude)</strong> and{" "}
            <strong>OpenAI</strong> &mdash; artificial intelligence and machine
            learning services;
          </li>
          <li>
            <strong>Mapbox</strong> and{" "}
            <strong>Google Maps</strong> &mdash; mapping and location services;
          </li>
          <li>
            <strong>Google Places</strong> &mdash; reviews, ratings, and
            location data;
          </li>
          <li>
            <strong>Resend</strong> &mdash; transactional email delivery;
          </li>
          <li>
            <strong>Exa.ai</strong> &mdash; neural web search for news and
            insights;
          </li>
          <li>
            Other providers as listed in our Privacy Policy.
          </li>
        </ol>

        <h3>11.2 Third-Party Terms</h3>
        <p>
          Your use of the Platform may be subject to the terms of service and
          privacy policies of these third-party providers. We encourage you to
          review their respective terms. We are not responsible for the
          practices, content, or availability of third-party services, and your
          interactions with them are at your own risk.
        </p>

        <h3>11.3 External Links</h3>
        <p>
          The Platform may contain links to third-party websites, including
          school websites, KHDA pages, news articles, and other external
          resources. These links are provided for convenience only. We do not
          endorse, control, or assume responsibility for the content, privacy
          practices, or availability of linked websites. Accessing external
          links is at your own risk and subject to those websites&rsquo; own
          terms.
        </p>

        <h3>11.4 Third-Party Service Interruptions</h3>
        <p>
          The availability of certain Platform features depends on third-party
          services. We shall not be liable for any interruption, degradation,
          or unavailability of features resulting from the failure, suspension,
          or modification of third-party services beyond our reasonable control.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 12. DISCLAIMER OF WARRANTIES */}
        {/* ---------------------------------------------------------------- */}
        <h2>12. Disclaimer of Warranties</h2>

        <h3>12.1 &ldquo;As Is&rdquo; Basis</h3>
        <p>
          THE PLATFORM AND ALL CONTENT, FEATURES, AND SERVICES ARE PROVIDED ON
          AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT
          WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR
          OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE
          COMPANY EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED
          TO:
        </p>
        <ol type="a">
          <li>
            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT;
          </li>
          <li>
            WARRANTIES THAT THE PLATFORM WILL MEET YOUR REQUIREMENTS, WILL BE
            UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE;
          </li>
          <li>
            WARRANTIES REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, OR
            TIMELINESS OF ANY CONTENT, INCLUDING SCHOOL INFORMATION, FEE DATA,
            KHDA RATINGS, AND AI-GENERATED CONTENT;
          </li>
          <li>
            WARRANTIES THAT DEFECTS WILL BE CORRECTED OR THAT THE PLATFORM OR
            ITS SERVERS ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS;
          </li>
          <li>
            WARRANTIES REGARDING THE RESULTS THAT MAY BE OBTAINED FROM THE USE
            OF THE PLATFORM OR THE ACCURACY OF AI-GENERATED RECOMMENDATIONS OR
            COMPARISONS.
          </li>
        </ol>

        <h3>12.2 Educational Decisions</h3>
        <p>
          WE EXPRESSLY DISCLAIM ANY WARRANTY OR REPRESENTATION THAT THE
          INFORMATION ON THE PLATFORM IS SUFFICIENT FOR MAKING EDUCATIONAL
          DECISIONS. CHOOSING A SCHOOL OR NURSERY FOR YOUR CHILD IS A
          SIGNIFICANT DECISION THAT SHOULD BE BASED ON YOUR OWN RESEARCH,
          SCHOOL VISITS, AND PROFESSIONAL ADVICE, AND NOT SOLELY ON INFORMATION
          OBTAINED THROUGH THE PLATFORM.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 13. LIMITATION OF LIABILITY */}
        {/* ---------------------------------------------------------------- */}
        <h2>13. Limitation of Liability</h2>

        <h3>13.1 Exclusion of Damages</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
          THE COMPANY, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, PARTNERS,
          SUPPLIERS, OR AFFILIATES BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY:
        </p>
        <ol type="a">
          <li>
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
            PUNITIVE DAMAGES;
          </li>
          <li>
            LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITY;
          </li>
          <li>
            DAMAGES ARISING FROM YOUR RELIANCE ON SCHOOL INFORMATION, FEE DATA,
            KHDA RATINGS, AI-GENERATED CONTENT, REVIEWS, OR ANY OTHER CONTENT
            ON THE PLATFORM;
          </li>
          <li>
            DAMAGES ARISING FROM A SCHOOL&rsquo;S FAILURE TO RESPOND TO YOUR
            ENQUIRY, A SCHOOL&rsquo;S ADMISSIONS DECISION, OR THE QUALITY OF
            EDUCATION PROVIDED BY ANY SCHOOL;
          </li>
          <li>
            DAMAGES ARISING FROM UNAUTHORISED ACCESS TO YOUR ACCOUNT OR
            PERSONAL DATA;
          </li>
          <li>
            DAMAGES ARISING FROM THE INTERRUPTION, SUSPENSION, OR TERMINATION
            OF THE SERVICE;
          </li>
        </ol>
        <p>
          WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE),
          STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT THE
          COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h3>13.2 Maximum Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY&rsquo;S
          TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR
          RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED
          THE GREATER OF: (A) THE TOTAL AMOUNT YOU HAVE PAID TO THE COMPANY
          FOR USE OF THE PLATFORM IN THE TWELVE (12) MONTHS PRECEDING THE
          EVENT GIVING RISE TO THE CLAIM; OR (B) ONE HUNDRED UNITED ARAB
          EMIRATES DIRHAMS (AED 100).
        </p>

        <h3>13.3 Essential Basis</h3>
        <p>
          You acknowledge that the limitations of liability in this Section
          reflect a reasonable allocation of risk between the parties and are an
          essential basis of the bargain between us. The Platform would not be
          provided to you without these limitations.
        </p>

        <h3>13.4 Jurisdictional Limitations</h3>
        <p>
          Some jurisdictions do not allow the exclusion or limitation of
          certain warranties or the exclusion of liability for certain types of
          damages. In such jurisdictions, our liability shall be limited to the
          fullest extent permitted by applicable law.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 14. INDEMNIFICATION */}
        {/* ---------------------------------------------------------------- */}
        <h2>14. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless the Company, its
          directors, officers, employees, agents, partners, suppliers,
          licensors, and affiliates from and against any and all claims,
          demands, losses, liabilities, damages, costs, and expenses (including
          reasonable legal fees and court costs) arising out of or relating to:
        </p>
        <ol type="a">
          <li>
            Your use or misuse of the Platform;
          </li>
          <li>
            Your violation of these Terms;
          </li>
          <li>
            Your violation of any applicable law, regulation, or third-party
            right;
          </li>
          <li>
            Any content or information you submit through the Platform,
            including enquiry submissions;
          </li>
          <li>
            Any dispute between you and a school or nursery arising from an
            enquiry submitted through the Platform;
          </li>
          <li>
            Your negligent or wrongful acts or omissions.
          </li>
        </ol>
        <p>
          We reserve the right, at our own expense, to assume the exclusive
          defence and control of any matter subject to indemnification by you,
          and you agree to cooperate with our defence of such claims.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 15. TERMINATION AND SUSPENSION */}
        {/* ---------------------------------------------------------------- */}
        <h2>15. Termination and Suspension</h2>

        <h3>15.1 Termination by the Company</h3>
        <p>
          We may, at our sole discretion and without prior notice or liability,
          suspend or terminate your account and access to the Platform for any
          reason, including but not limited to: breach of these Terms; suspected
          fraudulent, abusive, or illegal activity; extended inactivity;
          requests by law enforcement or governmental authorities; or
          discontinuance of the Platform.
        </p>

        <h3>15.2 Termination by User</h3>
        <p>
          You may terminate your account at any time by contacting us at{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a>. You may
          also stop using the Platform at any time.
        </p>

        <h3>15.3 Effects of Termination</h3>
        <p>
          Upon termination of your account:
        </p>
        <ol type="a">
          <li>
            Your right to access and use the Platform shall immediately cease;
          </li>
          <li>
            Your saved schools, preferences, and dashboard data will be deleted
            in accordance with our Privacy Policy;
          </li>
          <li>
            Enquiry data previously shared with schools will remain with those
            schools and is subject to their data retention practices;
          </li>
          <li>
            Sections of these Terms that by their nature should survive
            termination shall remain in effect, including but not limited to:
            intellectual property provisions, disclaimers, limitations of
            liability, indemnification, governing law, and dispute resolution.
          </li>
        </ol>

        {/* ---------------------------------------------------------------- */}
        {/* 16. COPYRIGHT AND DMCA */}
        {/* ---------------------------------------------------------------- */}
        <h2>16. Copyright Complaints and Takedown Requests</h2>

        <h3>16.1 Respect for Copyright</h3>
        <p>
          We respect the intellectual property rights of others and expect our
          users and listed schools to do the same. If you believe that your
          copyrighted work has been copied, used, or displayed on the Platform
          in a manner that constitutes copyright infringement, you may submit a
          takedown request to us.
        </p>

        <h3>16.2 Takedown Procedure</h3>
        <p>
          To submit a copyright complaint, please send a written notice to{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a> with the
          subject line &ldquo;Copyright Complaint&rdquo; containing the
          following information:
        </p>
        <ol type="a">
          <li>
            Identification of the copyrighted work you claim has been infringed;
          </li>
          <li>
            Identification of the material on the Platform that you claim is
            infringing, with sufficient detail for us to locate it (e.g., URL);
          </li>
          <li>
            Your contact information (name, address, email, and telephone
            number);
          </li>
          <li>
            A statement that you have a good-faith belief that the use of the
            material is not authorised by the copyright owner, its agent, or
            the law;
          </li>
          <li>
            A statement, made under penalty of perjury, that the information in
            the notice is accurate and that you are the copyright owner or
            authorised to act on the copyright owner&rsquo;s behalf;
          </li>
          <li>
            Your physical or electronic signature.
          </li>
        </ol>

        <h3>16.3 Response</h3>
        <p>
          Upon receiving a valid takedown request, we will investigate and, if
          appropriate, remove or disable access to the allegedly infringing
          material. We reserve the right to remove content in response to valid
          copyright complaints and to terminate the accounts of repeat
          infringers.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 17. GOVERNING LAW AND DISPUTE RESOLUTION */}
        {/* ---------------------------------------------------------------- */}
        <h2>17. Governing Law and Dispute Resolution</h2>

        <h3>17.1 Governing Law</h3>
        <p>
          These Terms and any dispute or claim arising out of or in connection
          with them or their subject matter or formation (including
          non-contractual disputes or claims) shall be governed by and
          construed in accordance with the laws of the United Arab Emirates and
          the applicable laws of the Emirate of Sharjah, without regard to
          conflict of law principles.
        </p>

        <h3>17.2 Jurisdiction</h3>
        <p>
          You agree to submit to the exclusive jurisdiction of the courts of
          Sharjah, United Arab Emirates, for the resolution of any dispute
          arising out of or relating to these Terms or your use of the
          Platform. Notwithstanding the foregoing, the Company retains the
          right to seek injunctive or other equitable relief in any court of
          competent jurisdiction to prevent the actual or threatened
          infringement, misappropriation, or violation of its intellectual
          property rights or confidential information.
        </p>

        <h3>17.3 Informal Resolution</h3>
        <p>
          Before initiating any formal legal proceedings, you agree to first
          contact us at{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a> and
          attempt to resolve the dispute informally. We will endeavour to
          resolve disputes through good-faith negotiation within thirty (30)
          days of receiving your complaint.
        </p>

        <h3>17.4 Waiver of Class Actions</h3>
        <p>
          To the fullest extent permitted by applicable law, you agree that any
          dispute resolution proceedings will be conducted on an individual
          basis only, and not as a class, consolidated, or representative
          action.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 18. MODIFICATIONS TO TERMS */}
        {/* ---------------------------------------------------------------- */}
        <h2>18. Modifications to Terms</h2>

        <h3>18.1 Right to Modify</h3>
        <p>
          We reserve the right to modify, amend, or update these Terms at any
          time at our sole discretion. When we make material changes, we will:
        </p>
        <ol type="a">
          <li>
            Update the &ldquo;Last Updated&rdquo; date at the top of this page;
          </li>
          <li>
            Post the revised Terms on the Platform;
          </li>
          <li>
            For material changes, provide notice through the Platform (e.g.,
            via a banner or notification) or by email to registered users at
            least fifteen (15) days before the changes take effect.
          </li>
        </ol>

        <h3>18.2 Acceptance of Modified Terms</h3>
        <p>
          Your continued use of the Platform after the effective date of any
          modifications constitutes your acceptance of the revised Terms. If
          you do not agree with the modified Terms, your sole remedy is to
          discontinue use of the Platform and terminate your account.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 19. FORCE MAJEURE */}
        {/* ---------------------------------------------------------------- */}
        <h2>19. Force Majeure</h2>
        <p>
          The Company shall not be liable for any failure or delay in
          performing its obligations under these Terms where such failure or
          delay results from circumstances beyond our reasonable control,
          including but not limited to: natural disasters, epidemics or
          pandemics, acts of God, war or threat of war, terrorism, civil
          unrest, government actions or sanctions, regulatory changes, labour
          disputes, power failures, internet or telecommunications failures,
          cyberattacks, failures of third-party service providers, or any other
          event that could not have been reasonably foreseen or avoided
          (&ldquo;Force Majeure Event&rdquo;). Our performance under these
          Terms shall be suspended for the duration of the Force Majeure Event.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 20. GENERAL PROVISIONS */}
        {/* ---------------------------------------------------------------- */}
        <h2>20. General Provisions</h2>

        <h3>20.1 Entire Agreement</h3>
        <p>
          These Terms, together with the Privacy Policy, Cookie Policy, and any
          other policies or agreements referenced herein, constitute the entire
          agreement between you and the Company regarding your use of the
          Platform and supersede all prior and contemporaneous agreements,
          proposals, representations, and understandings, whether written or
          oral.
        </p>

        <h3>20.2 Severability</h3>
        <p>
          If any provision of these Terms is found by a court of competent
          jurisdiction to be invalid, illegal, or unenforceable, such provision
          shall be modified to the minimum extent necessary to make it valid
          and enforceable, or if modification is not possible, shall be severed
          from these Terms. The remaining provisions shall continue in full
          force and effect.
        </p>

        <h3>20.3 Waiver</h3>
        <p>
          No failure or delay by the Company in exercising any right, power,
          or remedy under these Terms shall operate as a waiver thereof, nor
          shall any single or partial exercise of any right, power, or remedy
          preclude any other or further exercise thereof or the exercise of any
          other right, power, or remedy. A waiver of any provision of these
          Terms shall be effective only if made in writing and signed by the
          Company.
        </p>

        <h3>20.4 Assignment</h3>
        <p>
          You may not assign, transfer, or delegate your rights or obligations
          under these Terms without our prior written consent. We may freely
          assign, transfer, or delegate our rights and obligations under these
          Terms without restriction and without notice to you, including in
          connection with a merger, acquisition, reorganisation, or sale of
          assets.
        </p>

        <h3>20.5 No Third-Party Beneficiaries</h3>
        <p>
          These Terms are for the benefit of the parties hereto only and do not
          confer any rights on any third party, except that our affiliates,
          directors, officers, and employees are intended third-party
          beneficiaries of the indemnification, limitation of liability, and
          disclaimer provisions.
        </p>

        <h3>20.6 Notices</h3>
        <p>
          All notices from the Company to you may be delivered via email to the
          address associated with your account, by posting on the Platform, or
          by any other reasonable method. Notices from you to the Company must
          be sent to{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a> or to our
          registered address at Publishing City, Sharjah, UAE.
        </p>

        <h3>20.7 Language</h3>
        <p>
          These Terms are drafted in English. In the event of any discrepancy
          between the English version and any translated version, the English
          version shall prevail.
        </p>

        <h3>20.8 Headings</h3>
        <p>
          Section headings in these Terms are for convenience only and shall
          not affect the interpretation of any provision.
        </p>

        <h3>20.9 Relationship of the Parties</h3>
        <p>
          Nothing in these Terms shall be construed to create a joint venture,
          partnership, agency, employment, or fiduciary relationship between you
          and the Company. Neither party has the authority to bind the other or
          to incur obligations on the other&rsquo;s behalf.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 21. UAE REGULATORY COMPLIANCE */}
        {/* ---------------------------------------------------------------- */}
        <h2>21. UAE Regulatory Compliance</h2>

        <h3>21.1 KHDA Disclaimer</h3>
        <p>
          mydscvr.ai is an independent platform and is not affiliated with,
          endorsed by, or acting on behalf of the Knowledge and Human
          Development Authority (KHDA), the Abu Dhabi Department of Education
          and Knowledge (ADEK), the UAE Ministry of Education (MOE), or any
          other governmental or regulatory authority. KHDA inspection ratings,
          school data, and regulatory information displayed on the Platform are
          sourced from publicly available data and may not reflect the most
          current official records.
        </p>

        <h3>21.2 UAE Electronic Transactions Compliance</h3>
        <p>
          The Platform operates in compliance with the UAE Federal Law No. 46
          of 2021 on Electronic Transactions and Trust Services (and its
          predecessors), including provisions relating to electronic contracts,
          electronic records, and electronic communications. Your use of the
          Platform and acceptance of these Terms constitutes a valid electronic
          agreement.
        </p>

        <h3>21.3 Consumer Protection</h3>
        <p>
          Nothing in these Terms is intended to exclude or limit any rights you
          may have under the UAE Federal Law No. 15 of 2020 on Consumer
          Protection (as amended) that cannot be lawfully excluded or limited.
        </p>

        <h3>21.4 Anti-Money Laundering and Sanctions</h3>
        <p>
          You represent and warrant that you are not located in, organised
          under the laws of, or a resident of any country or territory that is
          subject to comprehensive UAE or international sanctions, and that you
          are not a person or entity designated on any applicable sanctions
          list. We reserve the right to restrict access to the Platform in
          compliance with applicable sanctions and anti-money laundering
          requirements.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* 22. CONTACT INFORMATION */}
        {/* ---------------------------------------------------------------- */}
        <h2>22. Contact Information</h2>
        <p>
          If you have any questions, concerns, or complaints about these Terms
          or the Platform, please contact us at:
        </p>
        <address className="not-italic">
          <strong>Jasmine Entertainment FZE</strong>
          <br />
          Publishing City, Sharjah
          <br />
          United Arab Emirates
          <br />
          <br />
          Email:{" "}
          <a href="mailto:support@mydscvr.ai">support@mydscvr.ai</a>
          <br />
          Website:{" "}
          <a href="https://mydscvr.ai" target="_blank" rel="noopener noreferrer">
            https://mydscvr.ai
          </a>
        </address>

        <hr />

        <p className="text-sm text-muted-foreground">
          By using mydscvr.ai, you acknowledge that you have read, understood,
          and agree to be bound by these Terms of Service.
        </p>
    </LegalPageLayout>
  );
}

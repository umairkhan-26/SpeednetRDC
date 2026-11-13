import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import LegalPage, { H2, P, UL, V } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy — SpeedNetRDC" };

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage title="Privacy Policy" locale={locale}>
      <P>
        This policy explains what personal data {COMPANY.tradingName} collects when you use this website and buy an eSIM, why, who we share it
        with, how long we keep it and the rights you have. We collect as little as we need to sell and deliver your eSIM.
      </P>

      <H2>1. Who we are</H2>
      <P>
        The data controller is <V>{COMPANY.legalName}</V>, trading as {COMPANY.tradingName}, registered at <V>{COMPANY.address}</V> (company
        number <V>{COMPANY.registrationNumber}</V>, VAT number <V>{COMPANY.vatNumber}</V>). For any privacy question or request, email{" "}
        <V>{COMPANY.privacyEmail}</V>.
      </P>

      <H2>2. What we collect and why</H2>
      <UL>
        <li>
          <strong>Your order:</strong> your name, email address, the plan and destination you chose, the price and the order date — to sell
          you the eSIM, send it to you and keep the records the law requires. Legal basis: performance of our contract with you, and our legal
          obligations (accounting and tax).
        </li>
        <li>
          <strong>Billing country:</strong> the country of your card&apos;s billing address, as reported by our payment provider — for tax
          (VAT) purposes and fraud prevention. We do not store the rest of your address. Legal basis: legal obligation and legitimate interests.
        </li>
        <li>
          <strong>Payment:</strong> you pay on Stripe&apos;s secure page. Stripe processes your card details; we never see or store your card
          number. We receive a payment reference and whether the payment succeeded.
        </li>
        <li>
          <strong>Your eSIM and its use:</strong> the SIM identifiers assigned to your order (ICCID and phone number/MSISDN) and, from our
          network partner, the SIM&apos;s status, when it was activated and last connected, the country it last connected from, and your
          remaining data and plan expiry — to deliver the service, answer support requests and prevent misuse. Legal basis: performance of our
          contract and legitimate interests. We do not see the content of your browsing or communications.
        </li>
        <li>
          <strong>Signing in:</strong> when you ask for a sign-in link we store a one-time code linked to your email address. Legal basis:
          performance of our contract.
        </li>
        <li>
          <strong>Security:</strong> to stop people guessing sign-in links and passwords, we count failed attempts using a scrambled
          (hashed) form of your IP address, which we delete after 24 hours. We do not store your IP address with your order. Legal basis:
          legitimate interests (keeping accounts and the service secure).
        </li>
        <li>
          <strong>Messages you send us:</strong> if you contact support, the content of your message and our reply — to help you. Legal basis:
          performance of our contract and legitimate interests.
        </li>
      </UL>
      <P>
        We do not sell your personal data. Only if you accept Meta cookies do we share limited information with Meta to measure and improve our
        ads (see section 3).
      </P>

      <H2>3. Cookies</H2>
      <P>
        <strong>Cookies needed for the site to work</strong> (always on):
      </P>
      <UL>
        <li>
          <strong>NEXT_LOCALE</strong> — remembers your chosen language.
        </li>
        <li>
          <strong>customer_session</strong> — keeps you signed in to &ldquo;My eSIMs&rdquo; for up to 30 days after you use a sign-in link.
          Removed when you sign out.
        </li>
        <li>
          <strong>snrdc_consent</strong> — remembers whether you accepted or rejected Meta cookies, for 6 months.
        </li>
      </UL>
      <P>
        <strong>Meta (Facebook) advertising cookies</strong> (only if you accept): when you first visit, we ask whether you accept them. Nothing
        from Meta is loaded until you click &ldquo;Accept&rdquo;, and nothing is sent to Meta if you click &ldquo;Reject&rdquo;. If you accept,
        the Meta Pixel sets the <strong>_fbp</strong> cookie (and <strong>_fbc</strong> if you arrived from a Meta ad), kept for up to 90 days,
        and we tell Meta:
      </P>
      <UL>
        <li>which pages you visit, which plan you look at, when you choose a plan and when you start checking out;</li>
        <li>
          when you buy: the order value, currency and plan, your email address and billing country in scrambled (hashed) form, Meta&apos;s
          browser identifiers above, and your browser type. We send the purchase from our server (Meta&apos;s Conversions API) as well as from
          your browser, with the same reference, so Meta counts it once. We never send your name, your IP address from our server, or your
          payment details.
        </li>
      </UL>
      <P>
        We use this to measure whether our ads work and to show our ads to people likely to be interested. Legal basis: your consent. For
        collecting this information and passing it to Meta, we and Meta Platforms Ireland Ltd are joint controllers; what Meta does with it
        afterwards is covered by Meta&apos;s own privacy policy (facebook.com/privacy/policy).
      </P>
      <P>
        You can change your choice at any time with &ldquo;Cookie settings&rdquo; at the bottom of every page. Choosing &ldquo;Reject&rdquo;
        stops the Meta Pixel and removes its cookies from your browser; information already sent to Meta stays with Meta. Stripe sets its own
        cookies on its payment page to prevent fraud.
      </P>

      <H2>4. Who we share data with</H2>
      <P>Only with service providers who need it to run the service, under contracts that require them to protect it:</P>
      <UL>
        <li>Stripe (payment processing and fraud prevention);</li>
        <li>our mobile network partner, which provides the eSIM and the connectivity;</li>
        <li>Resend (sending order and sign-in emails, from servers in the EU);</li>
        <li>Hostinger (website and database hosting);</li>
        <li>Meta Platforms Ireland Ltd (advertising measurement), only if you accept Meta cookies;</li>
        <li>authorities, when the law requires it.</li>
      </UL>
      <P>
        Some providers may process data outside the European Economic Area. When they do, the transfer is protected by an adequacy decision or
        the European Commission&apos;s Standard Contractual Clauses.
      </P>

      <H2>5. How long we keep it</H2>
      <UL>
        <li>
          Order, payment and invoice records: <V>{POLICY.orderRecordYears}</V> years, as required by accounting and tax law.
        </li>
        <li>SIM status information: for as long as we keep the order it belongs to.</li>
        <li>Sign-in links: deleted one day after they expire (they expire after 15 minutes).</li>
        <li>Hashed IP addresses used for security: 24 hours.</li>
        <li>Your cookie choice: 6 months, then we ask again. Meta&apos;s cookies: up to 90 days, or until you reject them.</li>
        <li>
          If you accepted Meta cookies when you ordered: the reference and browser details used for the purchase event, for as long as we keep
          the order.
        </li>
        <li>Support messages: for as long as needed to handle your request, then for up to 2 years.</li>
      </UL>

      <H2>6. Your rights</H2>
      <P>
        You can ask us to access, correct or delete your personal data, to restrict or object to how we use it, and to receive it in a
        portable format. Some data we must keep by law (for example invoices) even if you ask us to delete it. To make a request, email{" "}
        <V>{COMPANY.privacyEmail}</V>; we answer within one month. You can also complain to your data protection authority — ours is{" "}
        <V>{COMPANY.supervisoryAuthority}</V>.
      </P>

      <H2>7. Security</H2>
      <P>
        Your eSIM&apos;s installation details are only shown on a private order page with an unguessable link, and in your signed-in account.
        Treat that link like a password. Access to our systems is limited to staff who need it, and every staff sign-in is logged.
      </P>

      <H2>8. Changes</H2>
      <P>
        If we change this policy, we&apos;ll update the date at the top. Significant changes will be announced on this site. See also our{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link href="/refunds" className="font-semibold text-orange hover:underline">
          Refund Policy
        </Link>
        .
      </P>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
import { isPhysicalSimEnabled, pendingAnswer } from "@/lib/physical-sim";
import LegalPage, { H2, P, UL, V } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Refund Policy — SpeedNetRDC" };

export default async function RefundPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage title="Refund Policy" locale={locale}>
      <P>
        We want every eSIM to work. If it doesn&apos;t, contact us at <V>{COMPANY.supportEmail}</V> with your order number (ORD-…) and we&apos;ll
        help, or refund you as described below. This policy is part of our{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Terms &amp; Conditions
        </Link>{" "}
        and does not affect your statutory rights.
      </P>

      <H2>1. When your eSIM counts as &ldquo;activated&rdquo;</H2>
      <P>
        Your eSIM is <strong>activated</strong> on the day it first connects to a mobile network in a covered country and your plan starts
        (this is also when the plan&apos;s validity period begins). Buying the eSIM, receiving the email, or installing the QR code on your
        phone does <strong>not</strong> activate it. If you have never installed your eSIM, or you installed it but it has never connected to a
        network, it has not been activated.
      </P>

      <H2>2. Full refund</H2>
      <P>You get a full refund if:</P>
      <UL>
        <li>
          your eSIM has <strong>never been activated</strong> (never installed, or installed but never connected) and has not expired: ask us at
          any time before it expires and we will refund you in full; or
        </li>
        <li>
          your eSIM has been activated and you ask within <V>{POLICY.refundWindowDays}</V> days of the activation date, and it doesn&apos;t work
          in the destination it was sold for because of a problem on our or our network partner&apos;s side that we can&apos;t fix within a
          reasonable time; or
        </li>
        <li>we were unable to deliver your eSIM; or</li>
        <li>
          you bought a plan that does not cover the countries you need (for example a regional plan that leaves out your destination), the plan
          has not been used, and you tell us within <V>{POLICY.coverageSwitchDays}</V> days of activation (or at any time if it has never been
          activated): we will refund you in full, or switch you to a plan that covers your destination if you prefer (you then pay only the
          price difference); or
        </li>
        <li>you were charged twice for the same order.</li>
      </UL>

      <H2>3. When we can&apos;t refund</H2>
      <UL>
        <li>The eSIM was activated more than <V>{POLICY.refundWindowDays}</V> days ago, or the plan has been used, and the eSIM works as described.</li>
        <li>The data or validity period has been used up or has expired.</li>
        <li>
          Your device is not eSIM-compatible or is carrier-locked — please check the{" "}
          <Link href="/device-compatibility" className="font-semibold text-orange hover:underline">
            compatibility list
          </Link>{" "}
          before buying. If the eSIM has never been activated, the full-refund rule above still applies.
        </li>
        <li>The eSIM was deleted from your device after installation, or its settings were changed (for example, data roaming turned off).</li>
      </UL>
      <P>
        We look at every case individually — if something went wrong that isn&apos;t covered here, contact us and we&apos;ll be fair about it.
      </P>

      <H2>4. How refunds are paid</H2>
      <P>
        We aim to review each request within 24 to 48 business hours. Refunds go back to the card or payment method you used, through Stripe,
        usually within 5–10 business days of our approval depending on your bank. Once an order is refunded, we may deactivate its eSIM.
      </P>

      {isPhysicalSimEnabled() && (
        <>
          <H2>SIM cards</H2>
          <P>{pendingAnswer("returns", "en")}</P>
          <P>Data plans you add to a SIM card follow the rules above for plans.</P>
        </>
      )}

      <H2>5. Your right of withdrawal</H2>
      <P>
        Consumers in the EU and UK may also have a legal right of withdrawal — see section 7 of our{" "}
        <Link href="/terms" className="font-semibold text-orange hover:underline">
          Terms &amp; Conditions
        </Link>
        .
      </P>
    </LegalPage>
  );
}

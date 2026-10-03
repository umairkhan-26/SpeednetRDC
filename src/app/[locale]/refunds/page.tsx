import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { COMPANY, POLICY } from "@/lib/legal";
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

      <H2>1. Full refund</H2>
      <P>You get a full refund if:</P>
      <UL>
        <li>
          you ask within <V>{POLICY.refundWindowDays}</V> days of purchase and the eSIM has not been installed on a device and the plan has not
          started; or
        </li>
        <li>we were unable to deliver your eSIM; or</li>
        <li>
          the eSIM doesn&apos;t work in the destination it was sold for because of a problem on our or our network partner&apos;s side, and we
          can&apos;t fix it within a reasonable time; or
        </li>
        <li>you were charged twice for the same order.</li>
      </UL>

      <H2>2. When we can&apos;t refund</H2>
      <UL>
        <li>The plan has started (your device connected in a covered country) and the eSIM works as described.</li>
        <li>The data or validity period has been used up or has expired.</li>
        <li>
          Your device is not eSIM-compatible or is carrier-locked — please check the{" "}
          <Link href="/device-compatibility" className="font-semibold text-orange hover:underline">
            compatibility list
          </Link>{" "}
          before buying. If you haven&apos;t installed the eSIM yet, the full-refund rule above still applies.
        </li>
        <li>The eSIM was deleted from your device after installation, or its settings were changed (for example, data roaming turned off).</li>
      </UL>
      <P>
        We look at every case individually — if something went wrong that isn&apos;t covered here, contact us and we&apos;ll be fair about it.
      </P>

      <H2>3. How refunds are paid</H2>
      <P>
        Refunds go back to the card or payment method you used, through Stripe, usually within 5–10 business days of our approval depending on
        your bank. Once an order is refunded, we may deactivate its eSIM.
      </P>

      <H2>4. Your right of withdrawal</H2>
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

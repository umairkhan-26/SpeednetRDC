import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/legal";
import LegalPage, { H2, P, UL, V } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions — SpeedNetRDC" };

const linkClass = "font-semibold text-orange hover:underline";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage title="Terms & Conditions" locale={locale}>
      <P>
        These terms apply when you buy an eSIM data plan on this website. By placing an order you agree to them. Please also read our{" "}
        <Link href="/privacy" className={linkClass}>
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/refunds" className={linkClass}>
          Refund Policy
        </Link>
        .
      </P>

      <H2>1. About us</H2>
      <P>
        {COMPANY.tradingName} is operated by <V>{COMPANY.legalName}</V>, registered at <V>{COMPANY.address}</V>, company number{" "}
        <V>{COMPANY.registrationNumber}</V>, VAT number <V>{COMPANY.vatNumber}</V>. Contact us at <V>{COMPANY.supportEmail}</V>.
      </P>

      <H2>2. What you&apos;re buying</H2>
      <UL>
        <li>A prepaid, data-only eSIM plan for the destination, data allowance and validity shown when you ordered. It has no phone number for calls or texts unless the plan says otherwise.</li>
        <li>Connectivity is provided by our network partner and its partner networks in each destination. Speeds and coverage depend on local networks and are not guaranteed.</li>
        <li>
          You need an eSIM-compatible device that is not carrier-locked. Check the{" "}
          <Link href="/device-compatibility" className={linkClass}>
            device compatibility list
          </Link>{" "}
          before buying.
        </li>
      </UL>

      <H2>3. Orders and payment</H2>
      <UL>
        <li>Prices are shown in euros and include VAT where it applies. You pay in full at checkout through our payment provider, Stripe.</li>
        <li>A contract is formed when your payment is confirmed. We may cancel and fully refund an order if we cannot supply it (for example, a pricing error or a plan that is no longer available).</li>
        <li>You must give a valid email address: it is where your eSIM is delivered and how you sign in to &ldquo;My eSIMs&rdquo;.</li>
      </UL>

      <H2>4. Delivery and installation</H2>
      <UL>
        <li>We email you a private link to your order page with your eSIM QR code and installation instructions, usually within minutes of payment.</li>
        <li>Keep that link private: anyone who has it can install your eSIM. An eSIM can normally be installed only once; if you delete it from your device it may not be possible to reinstall it.</li>
        <li>Install the eSIM while you have an internet connection, ideally before you travel. You are responsible for installing it and for your device&apos;s settings (for example, turning on data roaming for the eSIM line).</li>
      </UL>

      <H2>5. Plan validity</H2>
      <UL>
        <li>Your plan starts the first time your device connects to a network in a country the plan covers (not when you buy or install it), unless the plan description says otherwise.</li>
        <li>It ends when its validity period runs out or its data is used up, whichever comes first. Unused data and validity are not refunded or carried over.</li>
      </UL>

      <H2>6. Fair and lawful use</H2>
      <P>
        You may use the service only for lawful, personal use. You may not resell it, use it in equipment that automatically connects other
        devices or machines (unless the plan allows it), or use it in a way that harms the network or other users. We may suspend a service
        that is used in breach of these rules.
      </P>

      <H2>7. Right of withdrawal</H2>
      <P>
        If you are a consumer in the EU or UK, you normally have 14 days to withdraw from a distance contract.{" "}
        <V>
          [TO CONFIRM WITH A LAWYER: because an eSIM is digital content supplied immediately, this right may end once supply has begun — but
          only if you expressly agreed at checkout to immediate supply and acknowledged that you would lose the right. The checkout does not
          yet ask for that consent.]
        </V>{" "}
        How refunds work in practice is described in our{" "}
        <Link href="/refunds" className={linkClass}>
          Refund Policy
        </Link>
        . Nothing in these terms affects your statutory rights.
      </P>

      <H2>8. Our liability</H2>
      <P>
        If the service doesn&apos;t work as described and we can&apos;t fix it, we will refund you as set out in the Refund Policy. We are not
        liable for losses that were not foreseeable, for business losses, or for problems caused by your device, its settings, or events
        outside our reasonable control (such as a local network outage). Nothing in these terms limits liability that cannot be limited by
        law, including for death or personal injury caused by negligence, or for fraud.
      </P>

      <H2>9. Changes to these terms</H2>
      <P>We may update these terms. The version that applies to your order is the one shown on this site when you placed it.</P>

      <H2>10. Law and disputes</H2>
      <P>
        These terms are governed by the law of <V>{COMPANY.governingLaw}</V>. If you are a consumer, you also keep the protection of the
        mandatory laws of the country where you live, and you can bring a claim in its courts. If you have a complaint, please contact us
        first at <V>{COMPANY.supportEmail}</V> — we&apos;ll do our best to resolve it.
      </P>
    </LegalPage>
  );
}

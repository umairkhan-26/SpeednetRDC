const steps = [
  "Open your phone settings",
  "Select Mobile / Cellular",
  "Add eSIM",
  "Scan the SpeedNetRDC QR code",
  "Enable SpeedNetRDC for mobile data",
];

export default function InstallSteps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, i) => (
        <li key={step} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
          <span className="flex size-8 items-center justify-center rounded-full bg-orange text-sm font-bold text-white">
            {i + 1}
          </span>
          <p className="text-sm font-medium text-ink">{step}</p>
        </li>
      ))}
    </ol>
  );
}

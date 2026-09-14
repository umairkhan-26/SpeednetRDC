import type { ActiveEsim } from "@/lib/types";

export default function NetworkSettingsTab({ esim }: { esim: ActiveEsim }) {
  const rows: { label: string; value: string }[] = [
    { label: "APN", value: esim.apn },
    { label: "Data roaming", value: esim.dataRoaming },
    { label: "Network selection", value: esim.networkSelection },
    { label: "Preferred network", value: esim.preferredNetwork },
    { label: "Partner network", value: esim.network },
    { label: "Line label", value: esim.lineLabel },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        If data does not connect after landing, confirm these settings on your phone.
      </p>
      <div className="divide-y divide-line rounded-xl border border-line bg-white">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-muted">{row.label}</span>
            <span className="font-medium text-ink">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

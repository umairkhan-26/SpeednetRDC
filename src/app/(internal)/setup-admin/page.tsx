import SetupAdminForm from "./SetupAdminForm";

export default function SetupAdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange">SpeedNetRDC</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Create the first admin account</h1>
        <p className="mt-1 text-sm text-muted">
          One-time setup, gated by a server secret. Refuses once any admin account already exists.
        </p>
        <SetupAdminForm />
      </div>
    </div>
  );
}

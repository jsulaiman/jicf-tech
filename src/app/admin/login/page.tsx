import { loginAdmin } from "@/lib/actions";
import { isAdminPasswordConfigured } from "@/lib/auth";
import SubmitButton from "@/app/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const configured = isAdminPasswordConfigured();

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Admin sign in
      </h1>

      {!configured ? (
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          No admin password is configured yet. Set the{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> environment
          variable and restart the app.
        </p>
      ) : (
        <form action={loginAdmin} className="space-y-4">
          <input type="hidden" name="next" value={params.next ?? "/admin"} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          {params.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Incorrect password. Try again.
            </p>
          ) : null}
          <SubmitButton className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
            Sign in
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

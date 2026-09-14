import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only once mounted on the client. Use to gate values that legitimately
 * differ between server and client render (locale-dependent date formatting,
 * timezone math, etc.) without tripping the "no setState in an effect" rule —
 * useSyncExternalStore's getServerSnapshot/getClientSnapshot split is the
 * primitive React itself recommends for this instead of a mounted-flag effect.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

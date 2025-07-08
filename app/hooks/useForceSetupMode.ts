import { useEffect, useState } from "react";

/**
 * Hook to check if setup mode is forced via environment variable
 * This is checked on the frontend by making a request to check setup status
 */
export function useForceSetupMode(): boolean {
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    // Check URL params for setup mode
    const params = new URLSearchParams(window.location.search);
    if (params.get("setup") === "true") {
      setIsSetupMode(true);
    }
  }, []);

  return isSetupMode;
}
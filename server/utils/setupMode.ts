/**
 * Simple setup mode detection for Railway deployments
 * This allows forcing the installation wizard to appear on Railway
 */

export function isInSetupMode(): boolean {
  // Check if FORCE_SETUP_MODE environment variable is set
  return process.env.FORCE_SETUP_MODE === "true";
}
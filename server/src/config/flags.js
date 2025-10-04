// Simple feature flag system. In production, consider LaunchDarkly/Unleash/etc.

export const defaultFlags = {
  gpt5: true, // Enable GPT-5 for all clients
}

export function getFlagsForUser(/* user */) {
  // Implement per-user/per-role logic here if needed. For now, all true.
  return { ...defaultFlags }
}

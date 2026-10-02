const { toCanonicalBaseAppVersion } = require("./appVersion");

const POLICY_CAPABILITY_VERSION = "1";

function withPolicyRequestHeaders(headers, appVersion) {
  const headerVersion = toCanonicalBaseAppVersion(appVersion);
  if (!headerVersion) {
    throw new Error("Policy requests require a canonical app version");
  }
  return {
    ...headers,
    "x-openwhispr-policy-version": POLICY_CAPABILITY_VERSION,
    "x-openwhispr-version": headerVersion,
  };
}

module.exports = { POLICY_CAPABILITY_VERSION, withPolicyRequestHeaders };

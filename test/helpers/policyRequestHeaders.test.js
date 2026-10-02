const test = require("node:test");
const assert = require("node:assert/strict");

const {
  POLICY_CAPABILITY_VERSION,
  withPolicyRequestHeaders,
} = require("../../src/helpers/policyRequestHeaders");

test("adds the exact policy capability and canonical app version headers", () => {
  assert.equal(POLICY_CAPABILITY_VERSION, "1");
  assert.deepEqual(withPolicyRequestHeaders({ Authorization: "Bearer token" }, "1.8.1"), {
    Authorization: "Bearer token",
    "x-openwhispr-policy-version": "1",
    "x-openwhispr-version": "1.8.1",
  });
});

test("does not allow callers to override desktop policy capability headers", () => {
  assert.deepEqual(
    withPolicyRequestHeaders(
      {
        "x-openwhispr-policy-version": "2",
        "x-openwhispr-version": "0.0.1",
      },
      "1.8.1"
    ),
    {
      "x-openwhispr-policy-version": "1",
      "x-openwhispr-version": "1.8.1",
    }
  );
});

test("rejects a non-canonical app version instead of advertising a malformed client", () => {
  assert.throws(() => withPolicyRequestHeaders({}, "1.8"), /canonical app version/i);
  assert.throws(() => withPolicyRequestHeaders({}, "1.8.1-beta.1"), /canonical app version/i);
});

test("advertises the canonical base for fork builds carrying a -custom suffix", () => {
  assert.deepEqual(withPolicyRequestHeaders({ Authorization: "Bearer token" }, "1.10.2-custom.2"), {
    Authorization: "Bearer token",
    "x-openwhispr-policy-version": "1",
    "x-openwhispr-version": "1.10.2",
  });
  assert.throws(() => withPolicyRequestHeaders({}, "1.10.2-custom"), /canonical app version/i);
  assert.throws(() => withPolicyRequestHeaders({}, "1.10.2-custom.beta"), /canonical app version/i);
});

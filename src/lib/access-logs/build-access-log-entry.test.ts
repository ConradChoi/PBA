import { describe, expect, it } from "vitest";
import { buildAccessLogEntry } from "./build-access-log-entry";

function headers(init: Record<string, string> = {}): Headers {
  return new Headers(init);
}

const owner = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "owner@ylia.io",
  app_metadata: { role: "owner" },
};

const staff = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "staff@ylia.io",
  app_metadata: { role: "staff" },
};

describe("buildAccessLogEntry", () => {
  it("records a granted request for a signed-in operator", () => {
    const entry = buildAccessLogEntry({
      path: "/admin/assessments",
      method: "GET",
      headers: headers(),
      user: owner,
    });

    expect(entry).toMatchObject({
      outcome: "granted",
      operator_id: owner.id,
      operator_email: "owner@ylia.io",
      method: "GET",
      path: "/admin/assessments",
    });
  });

  it("records a denied request with no account attached", () => {
    const entry = buildAccessLogEntry({
      path: "/admin/assessments",
      method: "GET",
      headers: headers(),
      user: null,
    });

    expect(entry).toMatchObject({
      outcome: "denied",
      operator_id: null,
      operator_email: null,
    });
  });

  it("keeps operator_email null when the account has no email", () => {
    const entry = buildAccessLogEntry({
      path: "/admin",
      method: "GET",
      headers: headers(),
      user: { ...owner, email: undefined },
    });

    expect(entry?.operator_email).toBeNull();
  });

  // The denied request is already recorded against the path the visitor
  // actually asked for; logging the login page it was redirected to would
  // count the same attempt twice.
  it("skips /admin/login", () => {
    expect(
      buildAccessLogEntry({
        path: "/admin/login",
        method: "GET",
        headers: headers(),
        user: null,
      })
    ).toBeNull();
  });

  // Next strips this header before middleware sees it (see the function's
  // comment), so in production the rule is unreachable and admin links are
  // kept from prefetching instead. The rule is still pinned here so it
  // behaves correctly if a future Next stops stripping it.
  it("skips Next.js router prefetches, on the day the header survives to middleware", () => {
    expect(
      buildAccessLogEntry({
        path: "/admin/assessments",
        method: "GET",
        headers: headers({ "Next-Router-Prefetch": "1" }),
        user: owner,
      })
    ).toBeNull();
  });

  it("still records a normal client-side navigation (RSC request, no prefetch header)", () => {
    const entry = buildAccessLogEntry({
      path: "/admin/assessments",
      method: "GET",
      headers: headers({ RSC: "1" }),
      user: owner,
    });

    expect(entry?.outcome).toBe("granted");
  });

  // 수행업무 is the point of the record, and every admin write lives under
  // /api/admin — including the one that destroys a person's data for good.
  describe("api routes", () => {
    it("records a purge as the write it is, not as a page view", () => {
      const entry = buildAccessLogEntry({
        path: "/api/admin/assessments/2f8a1c3e-9b4d-4a7e-8c1f-5d6e7a8b9c0d/purge",
        method: "POST",
        headers: headers(),
        user: owner,
      });

      expect(entry).toMatchObject({
        outcome: "granted",
        method: "POST",
        path: "/api/admin/assessments/2f8a1c3e-9b4d-4a7e-8c1f-5d6e7a8b9c0d/purge",
        subject_assessment_id: "2f8a1c3e-9b4d-4a7e-8c1f-5d6e7a8b9c0d",
      });
    });

    it("records an operator deletion", () => {
      const entry = buildAccessLogEntry({
        path: "/api/admin/operators/33333333-3333-3333-3333-333333333333",
        method: "DELETE",
        headers: headers(),
        user: owner,
      });

      expect(entry).toMatchObject({ outcome: "granted", method: "DELETE" });
    });
  });

  describe("outcome", () => {
    it("is forbidden for an authenticated account that is not an operator at all", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/assessments",
        method: "GET",
        headers: headers(),
        user: { id: "44444444-4444-4444-4444-444444444444", email: "someone@example.com" },
      });

      expect(entry?.outcome).toBe("forbidden");
      // The account is still named: knowing WHO exceeded their privileges is
      // the whole value of the row.
      expect(entry?.operator_email).toBe("someone@example.com");
    });

    it("is forbidden when a staff account reaches for an owner-only screen", () => {
      for (const path of ["/admin/operators", "/admin/access-logs", "/api/admin/operators"]) {
        expect(
          buildAccessLogEntry({ path, method: "GET", headers: headers(), user: staff })?.outcome,
          path
        ).toBe("forbidden");
      }
    });

    it("is forbidden on a nested owner-only path too", () => {
      const entry = buildAccessLogEntry({
        path: "/api/admin/operators/33333333-3333-3333-3333-333333333333",
        method: "DELETE",
        headers: headers(),
        user: staff,
      });

      expect(entry?.outcome).toBe("forbidden");
    });

    it("is granted when staff reaches a screen staff is allowed on", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/consulting-requests",
        method: "GET",
        headers: headers(),
        user: staff,
      });

      expect(entry?.outcome).toBe("granted");
    });

    it("is granted when the owner reaches an owner-only screen", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/access-logs",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.outcome).toBe("granted");
    });

    // A path that merely starts with the same characters is a different route.
    it("does not treat /admin/operators-something as owner-only", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/operators-export",
        method: "GET",
        headers: headers(),
        user: staff,
      });

      expect(entry?.outcome).toBe("granted");
    });
  });

  describe("subject_assessment_id", () => {
    it("is the assessment id when the path addresses one", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/assessments/2f8a1c3e-9b4d-4a7e-8c1f-5d6e7a8b9c0d",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.subject_assessment_id).toBe("2f8a1c3e-9b4d-4a7e-8c1f-5d6e7a8b9c0d");
    });

    it("is null on the list page", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/assessments",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.subject_assessment_id).toBeNull();
    });

    it("is null when the trailing segment is not a uuid", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/assessments/new",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.subject_assessment_id).toBeNull();
    });
  });

  describe("subject_consulting_request_id", () => {
    // This screen shows the person's name, email and free-text message — the
    // densest personal data in the panel — so it must not be the one access
    // with no 정보주체 recorded.
    it("is the request id when the path addresses a consulting request", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/consulting-requests/7c9e6679-7425-40de-944b-e07fc1f90ae7",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.subject_consulting_request_id).toBe(
        "7c9e6679-7425-40de-944b-e07fc1f90ae7"
      );
    });

    // The two columns mean different things: one is an assessments row, the
    // other a consulting_requests row. A request id in the assessment column
    // would point at a record that does not exist.
    it("does not leak into subject_assessment_id", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/consulting-requests/7c9e6679-7425-40de-944b-e07fc1f90ae7",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.subject_assessment_id).toBeNull();
    });

    it("is null on the list page", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/consulting-requests",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.subject_consulting_request_id).toBeNull();
    });
  });

  describe("ip", () => {
    it("takes the first entry of x-forwarded-for (the client, not the proxies)", () => {
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers({ "x-forwarded-for": "203.0.113.7, 70.132.1.1, 10.0.0.1" }),
        user: owner,
      });

      expect(entry?.ip).toBe("203.0.113.7");
    });

    it("falls back to cloudfront-viewer-address and drops its source port", () => {
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers({ "cloudfront-viewer-address": "203.0.113.7:51234" }),
        user: owner,
      });

      expect(entry?.ip).toBe("203.0.113.7");
    });

    it("keeps an IPv6 cloudfront-viewer-address as-is rather than guessing where the port starts", () => {
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers({ "cloudfront-viewer-address": "2001:db8::1:51234" }),
        user: owner,
      });

      expect(entry?.ip).toBe("2001:db8::1:51234");
    });

    it("is null when neither header is present", () => {
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.ip).toBeNull();
    });
  });

  describe("path", () => {
    it("is kept as sent when it is a real route", () => {
      const entry = buildAccessLogEntry({
        path: "/admin/notices/7c9e6679-7425-40de-944b-e07fc1f90ae7",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.path).toBe("/admin/notices/7c9e6679-7425-40de-944b-e07fc1f90ae7");
    });

    // Anyone can request /admin/<many kilobytes> without authenticating, and
    // every attempt writes a row kept for 13 months. Same reasoning as the
    // user agent cap.
    it("is truncated so an unauthenticated request cannot bloat the row", () => {
      const entry = buildAccessLogEntry({
        path: `/admin/${"x".repeat(5000)}`,
        method: "GET",
        headers: headers(),
        user: null,
      });

      expect(entry?.path).toHaveLength(512);
    });
  });

  describe("user_agent", () => {
    it("is kept as sent when it is a normal length", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/140.0.0.0 Safari/537.36";
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers({ "user-agent": ua }),
        user: owner,
      });

      expect(entry?.user_agent).toBe(ua);
    });

    // A header is attacker-controlled: without a cap, anyone can make each
    // denied request cost kilobytes of storage.
    it("is truncated so a hostile header cannot bloat the row", () => {
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers({ "user-agent": "x".repeat(5000) }),
        user: null,
      });

      expect(entry?.user_agent).toHaveLength(255);
    });

    it("is null when the header is absent", () => {
      const entry = buildAccessLogEntry({
        path: "/admin",
        method: "GET",
        headers: headers(),
        user: owner,
      });

      expect(entry?.user_agent).toBeNull();
    });
  });
});

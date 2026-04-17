import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type ReviewRow = {
  id: string;
  client_name: string;
  business_name: string | null;
  industry: string | null;
  review_headline: string | null;
  review_text: string;
  rating: number;
  featured: boolean;
  approved: boolean;
  project_type: string | null;
  project_url: string | null;
  client_logo_url: string | null;
  created_at: string;
};

type InquiryRow = {
  id: string;
  created_at: string;
  status: string;
  selected_plan: string;
  selected_addons: string[];
  plan_name: string;
  plan_setup_price: number;
  plan_monthly_price: number;
  addon_one_time_total: number;
  addon_monthly_total: number;
  domain_choice: string;
  domain_name: string | null;
  needs_domain_privacy: boolean;
  domain_one_time_fee: number;
  domain_privacy_monthly_fee: number;
  total_setup: number;
  total_monthly: number;
  full_name: string;
  email: string;
  business_name: string;
  phone: string | null;
  business_type: string | null;
  timeline: string | null;
  pages_needed: string | null;
  inspiration: string | null;
  goals: string | null;
  notes: string | null;
  inquiry_snapshot: Record<string, unknown>;
  payment_link_url: string | null;
  stripe_checkout_session_id: string | null;
  payment_sent_at: string | null;
  last_contacted_at: string | null;
};

type ClientRow = {
  id: string;
  pricing_inquiry_id: string | null;
  full_name: string;
  email: string;
  business_name: string;
  website_label: string | null;
  website_url: string | null;
  website_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  subscription_status: string | null;
  latest_invoice_id: string | null;
  last_invoice_status: string | null;
  current_period_end: string | null;
  last_payment_at: string | null;
  last_payment_amount: number | null;
  payment_method_update_url: string | null;
  payment_failed_at: string | null;
  grace_period_ends_at: string | null;
  shutdown_required: boolean;
  shutdown_marked_at: string | null;
  last_reminder_sent_at: string | null;
  reminder_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type TabKey = "reviews" | "requests" | "clients";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<TabKey>("reviews");

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setAuthLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    void loadAdminData();
  }, [session]);

  const pendingReviews = useMemo(
    () => reviews.filter((review) => !review.approved),
    [reviews]
  );

  const sortedInquiries = useMemo(() => {
    return [...inquiries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [inquiries]);

  const sortedClients = useMemo(() => {
    const priority = (client: ClientRow) => {
      if (client.shutdown_required) return 0;
      if (client.payment_failed_at) return 1;
      return 2;
    };

    return [...clients].sort((a, b) => {
      const pa = priority(a);
      const pb = priority(b);

      if (pa !== pb) return pa - pb;

      const aTime = new Date(a.updated_at ?? a.created_at).getTime();
      const bTime = new Date(b.updated_at ?? b.created_at).getTime();

      return bTime - aTime;
    });
  }, [clients]);

  const clientsNeedingShutdown = useMemo(
    () => clients.filter((client) => client.shutdown_required),
    [clients]
  );

  async function loadAdminData() {
    setDataLoading(true);
    setActionMessage("");

    const [reviewsRes, inquiriesRes, clientsRes] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("pricing_inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("client_accounts").select("*").order("updated_at", { ascending: false }),
    ]);

    const messages: string[] = [];

    if (reviewsRes.error) {
      messages.push(`Failed to load reviews: ${reviewsRes.error.message}`);
    }

    if (inquiriesRes.error) {
      messages.push(`Failed to load inquiries: ${inquiriesRes.error.message}`);
    }

    if (clientsRes.error) {
      messages.push(`Failed to load clients: ${clientsRes.error.message}`);
    }

    if (messages.length > 0) {
      setActionMessage(messages.join(" | "));
    }

    setReviews((reviewsRes.data ?? []) as ReviewRow[]);
    setInquiries((inquiriesRes.data ?? []) as InquiryRow[]);
    setClients((clientsRes.data ?? []) as ClientRow[]);
    setDataLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    }

    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function approveReview(reviewId: string) {
    setBusyId(reviewId);
    setActionMessage("");

    const { error } = await supabase
      .from("reviews")
      .update({ approved: true })
      .eq("id", reviewId);

    if (error) {
      setActionMessage(`Could not approve review: ${error.message}`);
    } else {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, approved: true } : review
        )
      );
      setActionMessage("Review approved.");
    }

    setBusyId(null);
  }

  async function deleteReview(reviewId: string) {
    const confirmed = window.confirm("Delete this review permanently?");
    if (!confirmed) return;

    setBusyId(reviewId);
    setActionMessage("");

    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      setActionMessage(`Could not delete review: ${error.message}`);
    } else {
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      setActionMessage("Review deleted.");
    }

    setBusyId(null);
  }

  async function updateInquiryStatus(inquiryId: string, status: string) {
    setBusyId(inquiryId);
    setActionMessage("");

    const nowIso = new Date().toISOString();

    const { error } = await supabase
      .from("pricing_inquiries")
      .update({
        status,
        last_contacted_at: nowIso,
      })
      .eq("id", inquiryId);

    if (error) {
      setActionMessage(`Could not update inquiry: ${error.message}`);
    } else {
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === inquiryId
            ? {
                ...inquiry,
                status,
                last_contacted_at: nowIso,
              }
            : inquiry
        )
      );
      setActionMessage("Inquiry updated.");
    }

    setBusyId(null);
  }

  async function createAndSendPaymentLink(inquiryId: string) {
    setBusyId(inquiryId);
    setActionMessage("");

    const { data, error } = await supabase.functions.invoke("create-payment-link", {
      body: { inquiryId },
    });

    if (error) {
      setActionMessage(`Could not create payment link: ${error.message}`);
      setBusyId(null);
      return;
    }

    const paymentUrl = data?.url as string | undefined;
    const subject = data?.emailSubject as string | undefined;
    const body = data?.emailBody as string | undefined;

    await loadAdminData();

    if (paymentUrl && subject && body) {
      const mailto = `mailto:${encodeURIComponent(
        data.customerEmail ?? ""
      )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.open(mailto, "_blank");
      window.open(paymentUrl, "_blank");
    }

    setActionMessage("Payment link created. Your email client and Stripe checkout opened.");
    setBusyId(null);
  }

  async function generatePortalLink(clientId: string) {
    setBusyId(clientId);
    setActionMessage("");

    const { data, error } = await supabase.functions.invoke("create-billing-portal-link", {
      body: { clientId },
    });

    if (error) {
      setActionMessage(`Could not create billing portal link: ${error.message}`);
      setBusyId(null);
      return;
    }

    await loadAdminData();

    const url = data?.url as string | undefined;
    if (url) {
      window.open(url, "_blank");
    }

    setActionMessage("Billing portal link created.");
    setBusyId(null);
  }

  async function sendManualReminder(clientId: string) {
    setBusyId(clientId);
    setActionMessage("");

    const { data, error } = await supabase.functions.invoke("process-client-billing", {
      body: {
        mode: "single",
        clientId,
        forceSendReminder: true,
      },
    });

    if (error) {
      setActionMessage(`Could not send reminder: ${error.message}`);
      setBusyId(null);
      return;
    }

    await loadAdminData();
    setActionMessage(data?.message || "Reminder processed.");
    setBusyId(null);
  }

  async function updateWebsiteInfo(clientId: string, existing: ClientRow) {
    const websiteLabel = window.prompt(
      "Website label",
      existing.website_label ?? existing.business_name
    );
    if (websiteLabel === null) return;

    const websiteUrl = window.prompt(
      "Website URL",
      existing.website_url ?? "https://"
    );
    if (websiteUrl === null) return;

    setBusyId(clientId);
    setActionMessage("");

    const { error } = await supabase
      .from("client_accounts")
      .update({
        website_label: websiteLabel.trim() || null,
        website_url: websiteUrl.trim() || null,
      })
      .eq("id", clientId);

    if (error) {
      setActionMessage(`Could not update website info: ${error.message}`);
    } else {
      setActionMessage("Website info updated.");
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                website_label: websiteLabel.trim() || null,
                website_url: websiteUrl.trim() || null,
              }
            : client
        )
      );
    }

    setBusyId(null);
  }

  async function markClientWebsiteStatus(clientId: string, websiteStatus: string) {
    setBusyId(clientId);
    setActionMessage("");

    const updatePayload: Partial<ClientRow> & {
      website_status: string;
      shutdown_required?: boolean;
      shutdown_marked_at?: string | null;
    } = {
      website_status: websiteStatus,
    };

    if (websiteStatus === "shut_down") {
      updatePayload.shutdown_required = false;
      updatePayload.shutdown_marked_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("client_accounts")
      .update(updatePayload)
      .eq("id", clientId);

    if (error) {
      setActionMessage(`Could not update website status: ${error.message}`);
    } else {
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                website_status: websiteStatus,
                shutdown_required:
                  websiteStatus === "shut_down" ? false : client.shutdown_required,
                shutdown_marked_at:
                  websiteStatus === "shut_down"
                    ? new Date().toISOString()
                    : client.shutdown_marked_at,
              }
            : client
        )
      );
      setActionMessage(`Website marked as ${websiteStatus.replaceAll("_", " ")}.`);
    }

    setBusyId(null);
  }

  function renderClientStatus(client: ClientRow) {
    if (client.shutdown_required) {
      return {
        label: "Needs Shutdown",
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (client.payment_failed_at) {
      return {
        label: "Payment Failed",
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (client.subscription_status === "active") {
      return {
        label: "Active",
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      label: client.subscription_status || "Unknown",
      background: "#e2e8f0",
      color: "#334155",
    };
  }

  if (authLoading) {
    return (
      <div style={pageWrap}>
        <div style={card}>Loading admin…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={pageWrap}>
        <form onSubmit={handleLogin} style={{ ...card, maxWidth: 460, width: "100%" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={eyebrow}>LEVAMEN TECH</div>
            <h1 style={title}>Admin Login</h1>
            <p style={muted}>
              Sign in with your Supabase auth account to access reviews, requests, and clients.
            </p>
          </div>

          <label style={label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={input}
            />
          </label>

          <label style={label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={input}
            />
          </label>

          {loginError ? <div style={errorBox}>{loginError}</div> : null}

          <button type="submit" disabled={loginLoading} style={primaryButton}>
            {loginLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={headerRow}>
            <div>
              <div style={eyebrow}>LEVAMEN TECH</div>
              <h1 style={title}>Admin Panel</h1>
              <p style={muted}>
                Manage reviews, pricing requests, and active billing clients.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setTab("reviews")}
                style={tab === "reviews" ? activeTabButton : tabButton}
              >
                Reviews ({pendingReviews.length} pending)
              </button>

              <button
                onClick={() => setTab("requests")}
                style={tab === "requests" ? activeTabButton : tabButton}
              >
                Requests ({inquiries.length})
              </button>

              <button
                onClick={() => setTab("clients")}
                style={tab === "clients" ? activeTabButton : tabButton}
              >
                Clients ({clients.length})
              </button>

              <button onClick={handleLogout} style={secondaryButton}>
                Log out
              </button>
            </div>
          </div>
        </div>

        {tab === "clients" && clientsNeedingShutdown.length > 0 ? (
          <div style={{ ...card, marginBottom: 20, border: "2px solid #fecaca" }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: "#991b1b" }}>
              Clients needing shutdown
            </div>
            <div style={{ color: "#7f1d1d", lineHeight: 1.6 }}>
              {clientsNeedingShutdown.map((client) => client.business_name).join(", ")}
            </div>
          </div>
        ) : null}

        {actionMessage ? <div style={{ ...card, marginBottom: 20 }}>{actionMessage}</div> : null}

        {dataLoading ? (
          <div style={card}>Loading admin data…</div>
        ) : tab === "reviews" ? (
          <div style={stack}>
            {reviews.length === 0 ? (
              <div style={card}>No reviews found.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} style={card}>
                  <div style={rowBetween}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 22 }}>
                        {review.review_headline || "Untitled review"}
                      </h2>
                      <p style={muted}>
                        {review.client_name}
                        {review.business_name ? ` • ${review.business_name}` : ""}
                        {review.industry ? ` • ${review.industry}` : ""}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: review.approved ? "#e6ffed" : "#fff5d6",
                        fontWeight: 700,
                      }}
                    >
                      {review.approved ? "Approved" : "Pending"}
                    </div>
                  </div>

                  <p style={{ marginTop: 16, lineHeight: 1.7 }}>{review.review_text}</p>

                  <div style={detailGrid}>
                    <div><strong>Rating:</strong> {review.rating}/5</div>
                    <div><strong>Featured:</strong> {review.featured ? "Yes" : "No"}</div>
                    <div><strong>Project type:</strong> {review.project_type || "—"}</div>
                    <div><strong>Project URL:</strong> {review.project_url || "—"}</div>
                    <div><strong>Created:</strong> {new Date(review.created_at).toLocaleString()}</div>
                  </div>

                  <div style={actionsRow}>
                    {!review.approved && (
                      <button
                        onClick={() => approveReview(review.id)}
                        disabled={busyId === review.id}
                        style={primaryButton}
                      >
                        {busyId === review.id ? "Approving..." : "Approve"}
                      </button>
                    )}

                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={busyId === review.id}
                      style={dangerButton}
                    >
                      {busyId === review.id ? "Working..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === "requests" ? (
          <div style={stack}>
            {sortedInquiries.length === 0 ? (
              <div style={card}>No pricing inquiries found.</div>
            ) : (
              sortedInquiries.map((inquiry) => (
                <div key={inquiry.id} style={card}>
                  <div style={rowBetween}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 22 }}>{inquiry.business_name}</h2>
                      <p style={muted}>
                        {inquiry.full_name} • {inquiry.email}
                        {inquiry.phone ? ` • ${inquiry.phone}` : ""}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "#eef2ff",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {inquiry.status}
                    </div>
                  </div>

                  <div style={detailGrid}>
                    <div><strong>Plan:</strong> {inquiry.plan_name}</div>
                    <div><strong>Setup total:</strong> {currency.format(Number(inquiry.total_setup || 0))}</div>
                    <div><strong>Monthly total:</strong> {currency.format(Number(inquiry.total_monthly || 0))}</div>
                    <div><strong>Domain:</strong> {inquiry.domain_choice}{inquiry.domain_name ? ` (${inquiry.domain_name})` : ""}</div>
                    <div><strong>Timeline:</strong> {inquiry.timeline || "—"}</div>
                    <div><strong>Pages needed:</strong> {inquiry.pages_needed || "—"}</div>
                    <div><strong>Business type:</strong> {inquiry.business_type || "—"}</div>
                    <div><strong>Created:</strong> {new Date(inquiry.created_at).toLocaleString()}</div>
                  </div>

                  {inquiry.selected_addons?.length ? (
                    <div style={{ marginTop: 16 }}>
                      <strong>Add-ons:</strong> {inquiry.selected_addons.join(", ")}
                    </div>
                  ) : null}

                  {inquiry.goals ? (
                    <div style={{ marginTop: 16 }}>
                      <strong>Goals:</strong>
                      <p style={paragraph}>{inquiry.goals}</p>
                    </div>
                  ) : null}

                  {inquiry.notes ? (
                    <div style={{ marginTop: 16 }}>
                      <strong>Notes:</strong>
                      <p style={paragraph}>{inquiry.notes}</p>
                    </div>
                  ) : null}

                  {inquiry.payment_link_url ? (
                    <div style={{ marginTop: 16 }}>
                      <strong>Current payment link:</strong>{" "}
                      <a href={inquiry.payment_link_url} target="_blank" rel="noreferrer">
                        Open Stripe Checkout
                      </a>
                    </div>
                  ) : null}

                  <div style={actionsRow}>
                    <button
                      onClick={() => updateInquiryStatus(inquiry.id, "contacted")}
                      disabled={busyId === inquiry.id}
                      style={secondaryButton}
                    >
                      Mark Contacted
                    </button>

                    <button
                      onClick={() => updateInquiryStatus(inquiry.id, "approved")}
                      disabled={busyId === inquiry.id}
                      style={secondaryButton}
                    >
                      Mark Approved
                    </button>

                    <button
                      onClick={() => createAndSendPaymentLink(inquiry.id)}
                      disabled={busyId === inquiry.id}
                      style={primaryButton}
                    >
                      {busyId === inquiry.id ? "Creating..." : "Send Payment Link"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={stack}>
            {sortedClients.length === 0 ? (
              <div style={card}>
                No clients found yet. Clients will appear here after Stripe checkout
                completion is synced into <code>client_accounts</code>.
              </div>
            ) : (
              sortedClients.map((client) => {
                const statusPill = renderClientStatus(client);

                return (
                  <div key={client.id} style={card}>
                    <div style={rowBetween}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 22 }}>{client.business_name}</h2>
                        <p style={muted}>
                          {client.full_name} • {client.email}
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          background: statusPill.background,
                          color: statusPill.color,
                          fontWeight: 700,
                        }}
                      >
                        {statusPill.label}
                      </div>
                    </div>

                    <div style={detailGrid}>
                      <div>
                        <strong>Website:</strong>{" "}
                        {client.website_url ? (
                          <a href={client.website_url} target="_blank" rel="noreferrer">
                            {client.website_label || client.website_url}
                          </a>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div><strong>Website status:</strong> {client.website_status}</div>
                      <div><strong>Subscription:</strong> {client.subscription_status || "—"}</div>
                      <div><strong>Last invoice:</strong> {client.last_invoice_status || "—"}</div>
                      <div>
                        <strong>Last payment:</strong>{" "}
                        {client.last_payment_at
                          ? `${new Date(client.last_payment_at).toLocaleString()}${
                              client.last_payment_amount != null
                                ? ` • ${currency.format(Number(client.last_payment_amount))}`
                                : ""
                            }`
                          : "—"}
                      </div>
                      <div>
                        <strong>Current period end:</strong>{" "}
                        {client.current_period_end
                          ? new Date(client.current_period_end).toLocaleDateString()
                          : "—"}
                      </div>
                      <div>
                        <strong>Payment failed at:</strong>{" "}
                        {client.payment_failed_at
                          ? new Date(client.payment_failed_at).toLocaleString()
                          : "—"}
                      </div>
                      <div>
                        <strong>Grace period ends:</strong>{" "}
                        {client.grace_period_ends_at
                          ? new Date(client.grace_period_ends_at).toLocaleString()
                          : "—"}
                      </div>
                      <div><strong>Reminder count:</strong> {client.reminder_count}</div>
                    </div>

                    {client.notes ? (
                      <div style={{ marginTop: 16 }}>
                        <strong>Notes:</strong>
                        <p style={paragraph}>{client.notes}</p>
                      </div>
                    ) : null}

                    {client.shutdown_required ? (
                      <div
                        style={{
                          marginTop: 16,
                          padding: 14,
                          borderRadius: 14,
                          background: "#fef2f2",
                          color: "#991b1b",
                          fontWeight: 600,
                        }}
                      >
                        This client has passed the grace period and should have their site shut down.
                      </div>
                    ) : null}

                    <div style={actionsRow}>
                      <button
                        onClick={() => updateWebsiteInfo(client.id, client)}
                        disabled={busyId === client.id}
                        style={secondaryButton}
                      >
                        Edit Website Info
                      </button>

                      <button
                        onClick={() => generatePortalLink(client.id)}
                        disabled={busyId === client.id}
                        style={secondaryButton}
                      >
                        {busyId === client.id ? "Working..." : "Open Billing Portal"}
                      </button>

                      <button
                        onClick={() => sendManualReminder(client.id)}
                        disabled={busyId === client.id}
                        style={primaryButton}
                      >
                        {busyId === client.id ? "Working..." : "Send Reminder"}
                      </button>

                      <button
                        onClick={() => markClientWebsiteStatus(client.id, "paused")}
                        disabled={busyId === client.id}
                        style={secondaryButton}
                      >
                        Mark Paused
                      </button>

                      <button
                        onClick={() => markClientWebsiteStatus(client.id, "shut_down")}
                        disabled={busyId === client.id}
                        style={dangerButton}
                      >
                        Mark Shut Down
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, rgba(14,23,42,1) 0%, rgba(30,41,59,1) 45%, rgba(15,23,42,1) 100%)",
  padding: "32px 20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  color: "#0f172a",
};

const stack: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.96)",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  alignItems: "center",
};

const rowBetween: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 20,
};

const detailGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#475569",
  marginBottom: 8,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.1,
};

const muted: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#475569",
  lineHeight: 1.6,
};

const paragraph: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#334155",
  lineHeight: 1.7,
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 16,
  fontWeight: 600,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer",
  background: "#0f172a",
  color: "#ffffff",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer",
  background: "#ffffff",
  color: "#0f172a",
};

const dangerButton: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer",
  background: "#dc2626",
  color: "#ffffff",
};

const tabButton: React.CSSProperties = {
  ...secondaryButton,
};

const activeTabButton: React.CSSProperties = {
  ...primaryButton,
};

const errorBox: React.CSSProperties = {
  marginBottom: 16,
  background: "#fee2e2",
  color: "#991b1b",
  padding: "12px 14px",
  borderRadius: 12,
};
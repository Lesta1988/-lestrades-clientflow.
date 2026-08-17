const cfg = window.CLIENTFLOW_CONFIG || {};
const form = document.getElementById("leadForm");
const success = document.getElementById("success");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function sourceFromUrl() {
  const p = new URLSearchParams(location.search);
  return p.get("utm_source") || p.get("source") || document.referrer || "Public Link";
}
function campaignFromUrl() {
  const p = new URLSearchParams(location.search);
  return p.get("utm_campaign") || "";
}
function normalizePhone(v) {
  return v.replace(/[^\d+]/g, "").trim();
}
function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}
function suggestedFollowup(timeline) {
  if (timeline === "Today") return futureDate(0);
  if (timeline === "Within 3 days") return futureDate(1);
  if (timeline === "Within 1 week") return futureDate(2);
  if (timeline === "Within 1 month") return futureDate(5);
  return futureDate(7);
}
function leadPayload() {
  const interest = document.getElementById("interest").value;
  const details = document.getElementById("details").value.trim();
  return {
    name: document.getElementById("name").value.trim(),
    phone: normalizePhone(document.getElementById("phone").value),
    stage: "Enquirer",
    source: sourceFromUrl().slice(0,120),
    campaign: campaignFromUrl().slice(0,120),
    interest: details ? `${interest}: ${details}` : interest,
    budget: Number(document.getElementById("budget").value || 0),
    timeline: document.getElementById("timeline").value,
    owner: cfg.DEFAULT_OWNER || "Sales Team",
    follow_up: suggestedFollowup(document.getElementById("timeline").value),
    notes: "Submitted via public acquisition form",
    consent: true
  };
}
async function saveSupabase(payload) {
  const client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const { error } = await client.from("leads").insert([payload]);
  if (error) throw error;
}
function saveLocal(payload) {
  const key = "clientflow_contacts_v2";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  const duplicate = current.find(x => x.phone === payload.phone);
  if (duplicate) {
    duplicate.interest = payload.interest;
    duplicate.timeline = payload.timeline;
    duplicate.budget = payload.budget;
    duplicate.source = payload.source;
    duplicate.campaign = payload.campaign;
    duplicate.followUp = payload.follow_up;
    duplicate.notes = "Re-submitted via public acquisition form";
    duplicate.updatedAt = Date.now();
  } else {
    current.unshift({
      id: crypto.randomUUID(),
      name: payload.name,
      phone: payload.phone,
      stage: payload.stage,
      source: payload.source,
      campaign: payload.campaign,
      interest: payload.interest,
      budget: payload.budget,
      timeline: payload.timeline,
      owner: payload.owner,
      followUp: payload.follow_up,
      notes: payload.notes,
      consent: true,
      updatedAt: Date.now()
    });
  }
  localStorage.setItem(key, JSON.stringify(current));
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  const payload = leadPayload();

  if (!payload.name || !payload.phone || !payload.interest || !payload.timeline) {
    statusEl.textContent = "Please complete all required fields.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Request";
    return;
  }

  try {
    const cloudMode = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
    if (cloudMode) await saveSupabase(payload);
    else saveLocal(payload);

    form.classList.add("hidden");
    success.classList.remove("hidden");

    const wa = (cfg.WHATSAPP_NUMBER || "").replace(/\D/g,"");
    const msg = encodeURIComponent(`Hi ${cfg.BUSINESS_NAME || "Lestrades"}, I just submitted a request for ${payload.interest}.`);
    const waBtn = document.getElementById("whatsappBtn");
    if (wa) waBtn.href = `https://wa.me/${wa}?text=${msg}`;
    else waBtn.classList.add("hidden");
  } catch(err) {
    console.error(err);
    statusEl.textContent = "We couldn't submit your request. Please try again.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Request";
  }
});
document.getElementById("anotherBtn").addEventListener("click", () => {
  form.reset();
  success.classList.add("hidden");
  form.classList.remove("hidden");
  submitBtn.disabled = false;
  submitBtn.textContent = "Send Request";
});

// ============================================================
// AdminDashboard.jsx — Paneli i administratorit
// E përdor vetëm administratori. Ka tri skeda:
//   Statistikat → numrat e përgjithshëm dhe shiritat krahasues
//   Shpalljet   → filtrim dhe miratim/refuzim i shpalljeve
//   Kandidatët  → filtrim i aplikimeve sipas departamentit, kompanisë, statusit
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet kur hapet faqja ose kur ndryshon një vlerë
import { useEffect, useState } from "react";
// Funksionet që flasin me endpoint-et e administratorit (admin/*.php)
import { getJobsForAdmin, reviewJob, getCandidatesForAdmin, getCompaniesForAdmin, getAdminStats } from "../services/adminService";
// Lista e departamenteve, e njëjta që përdoret edhe te shpalljet
import { getCategories } from "../services/jobService";

// Përkthimi i statusit të SHPALLJES në shqip
const statusLabels = {
  pending: "Në pritje", approved: "Aprovuar", rejected: "Refuzuar", closed: "Mbyllur",
};
// Përkthimi i statusit të APLIKIMIT në shqip
const appStatusLabels = {
  pending: "Në pritje", reviewed: "Shqyrtuar", accepted: "Pranuar", rejected: "Refuzuar",
};

export default function AdminDashboard() {
  // ---------- GJENDJA (STATE) ----------

  // Cila skedë është e hapur. Fillimisht "Statistikat".
  const [tab, setTab] = useState("stats"); // "stats" | "jobs" | "candidates"
  const [categories, setCategories] = useState([]); // departamentet (për filtrat)
  const [companies, setCompanies] = useState([]);   // kompanitë (për filtrin e kandidatëve)

  // --- Statistikat ---
  const [stats, setStats] = useState(null); // null derisa të vijnë nga serveri

  // --- Shpalljet ---
  const [jobs, setJobs] = useState([]);
  // Filtri i statusit fillon me "pending": administratori sheh
  // menjëherë shpalljet që presin miratim.
  const [jobStatusFilter, setJobStatusFilter] = useState("pending");
  const [jobCategoryFilter, setJobCategoryFilter] = useState("");

  // --- Kandidatët ---
  const [candidates, setCandidates] = useState([]);
  const [candCategoryFilter, setCandCategoryFilter] = useState("");
  const [candCompanyFilter, setCandCompanyFilter] = useState("");
  const [candStatusFilter, setCandStatusFilter] = useState("");

  // ---------- EFEKTET (useEffect) ----------

  // 1. Një herë kur hapet faqja: merr departamentet dhe kompanitë për listat e filtrave
  useEffect(() => {
    getCategories().then(setCategories);
    getCompaniesForAdmin().then(setCompanies);
  }, []);

  // 2. Kur hapet skeda "Statistikat" → merr statistikat nga admin/stats.php
  useEffect(() => {
    if (tab === "stats") getAdminStats().then(setStats);
  }, [tab]);

  // 3. Kur hapet skeda "Shpalljet" OSE ndryshon një filtër i saj → rimerr shpalljet.
  //    Kështu lista përditësohet vetë sa herë zgjidhet një filtër, pa buton "Kërko".
  useEffect(() => {
    if (tab === "jobs") loadJobs();
  }, [tab, jobStatusFilter, jobCategoryFilter]);

  // 4. Njësoj për skedën "Kandidatët" dhe tre filtrat e saj
  useEffect(() => {
    if (tab === "candidates") loadCandidates();
  }, [tab, candCategoryFilter, candCompanyFilter, candStatusFilter]);

  // ---------- FUNKSIONET ----------

  // Merr shpalljet sipas filtrave (GET admin/jobs.php?status=...&category_id=...).
  // Filtrimi i vërtetë bëhet në backend.
  async function loadJobs() {
    const data = await getJobsForAdmin({ status: jobStatusFilter, category_id: jobCategoryFilter });
    setJobs(data);
  }

  // Merr aplikimet sipas filtrave (GET admin/candidates.php?...)
  async function loadCandidates() {
    const data = await getCandidatesForAdmin({
      category_id: candCategoryFilter,
      company_id: candCompanyFilter,
      status: candStatusFilter,
    });
    setCandidates(data);
  }

  // Kur administratori klikon "Aprovo" ose "Refuzo":
  // dërgon statusin e ri (PUT admin/jobs.php), pastaj rimerr listën.
  // Me filtrin "Në pritje", shpallja e miratuar zhduket nga lista.
  async function handleReview(jobId, status) {
    await reviewJob(jobId, status);
    loadJobs();
  }

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Paneli i Administratorit</h1>

      {/* ===== Butonat e skedave =====
          Skeda aktive është blu; të tjerat të bardha me kornizë */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2 rounded ${tab === "stats" ? "bg-indigo-600 text-white" : "bg-white border"}`}
        >
          Statistikat
        </button>
        <button
          onClick={() => setTab("jobs")}
          className={`px-4 py-2 rounded ${tab === "jobs" ? "bg-indigo-600 text-white" : "bg-white border"}`}
        >
          Shpalljet
        </button>
        <button
          onClick={() => setTab("candidates")}
          className={`px-4 py-2 rounded ${tab === "candidates" ? "bg-indigo-600 text-white" : "bg-white border"}`}
        >
          Kandidatët
        </button>
      </div>

      {/* ===== SKEDA 1: STATISTIKAT ===== */}
      {tab === "stats" && (
        <div>
          {!stats ? (
            <p className="text-gray-500">Duke ngarkuar...</p>
          ) : (
            <>
              {/* Katër kartat numerike: totalet (COUNT në backend) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stats.totals.jobs}</p>
                  <p className="text-sm text-gray-500 mt-1">Shpallje gjithsej</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stats.totals.applications}</p>
                  <p className="text-sm text-gray-500 mt-1">Aplikime gjithsej</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stats.totals.candidates}</p>
                  <p className="text-sm text-gray-500 mt-1">Kandidatë</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stats.totals.companies}</p>
                  <p className="text-sm text-gray-500 mt-1">Kompani</p>
                </div>
              </div>

              {/* Shiritat krahasues sipas statusit (GROUP BY status në backend).
                  max = totali, që shiriti të tregojë pjesën nga i gjithi. */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="font-semibold mb-4">Shpalljet sipas statusit</h3>
                  <StatBar label="Në pritje" value={stats.jobs_by_status.pending} max={stats.totals.jobs} color="bg-yellow-500" />
                  <StatBar label="Aprovuar" value={stats.jobs_by_status.approved} max={stats.totals.jobs} color="bg-green-500" />
                  <StatBar label="Refuzuar" value={stats.jobs_by_status.rejected} max={stats.totals.jobs} color="bg-red-500" />
                  <StatBar label="Mbyllur" value={stats.jobs_by_status.closed} max={stats.totals.jobs} color="bg-gray-400" />
                </div>

                <div className="bg-white rounded-xl shadow p-5">
                  <h3 className="font-semibold mb-4">Aplikimet sipas statusit</h3>
                  <StatBar label="Në pritje" value={stats.applications_by_status.pending} max={stats.totals.applications} color="bg-yellow-500" />
                  <StatBar label="Shqyrtuar" value={stats.applications_by_status.reviewed} max={stats.totals.applications} color="bg-blue-500" />
                  <StatBar label="Pranuar" value={stats.applications_by_status.accepted} max={stats.totals.applications} color="bg-green-500" />
                  <StatBar label="Refuzuar" value={stats.applications_by_status.rejected} max={stats.totals.applications} color="bg-red-500" />
                </div>
              </div>

              {/* Top 5 departamentet.
                  parseInt → MySQL i kthen numrat si tekst, prandaj kthehen në numra.
                  max = departamenti me më shumë shpallje (shiriti i tij është 100%).
                  , 1 brenda Math.max → që max të mos jetë 0 nëse nuk ka të dhëna. */}
              <div className="bg-white rounded-xl shadow p-5 mt-6">
                <h3 className="font-semibold mb-4">Top 5 departamentet me më shumë shpallje</h3>
                {stats.top_categories.map((c) => (
                  <StatBar
                    key={c.name}
                    label={c.name}
                    value={parseInt(c.total)}
                    max={Math.max(...stats.top_categories.map((x) => parseInt(x.total)), 1)}
                    color="bg-indigo-500"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== SKEDA 2: SHPALLJET ===== */}
      {tab === "jobs" && (
        <div>
          {/* Filtrat: statusi dhe departamenti.
              Çdo ndryshim ndez useEffect-in 3, që rimerr listën. */}
          <div className="flex gap-3 mb-4">
            <select
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Të gjitha statuset</option>
              <option value="pending">Në pritje</option>
              <option value="approved">Aprovuar</option>
              <option value="rejected">Refuzuar</option>
              <option value="closed">Mbyllur</option>
            </select>

            <select
              value={jobCategoryFilter}
              onChange={(e) => setJobCategoryFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Të gjitha departamentet</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Lista e shpalljeve */}
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">{job.title}</h2>
                  {/* || "—" → nëse shpallja nuk ka departament, shfaq vizë */}
                  <p className="text-sm text-gray-500">
                    {job.company_name} · {job.category_name || "—"} · {job.location}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {statusLabels[job.status]}
                  </span>
                </div>
                {/* Butonat Aprovo/Refuzo shfaqen VETËM për shpalljet në pritje */}
                {job.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(job.id, "approved")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Aprovo
                    </button>
                    <button
                      onClick={() => handleReview(job.id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Refuzo
                    </button>
                  </div>
                )}
              </div>
            ))}
            {jobs.length === 0 && <p className="text-gray-500">Nuk ka shpallje me këto filtra.</p>}
          </div>
        </div>
      )}

      {/* ===== SKEDA 3: KANDIDATËT (aplikimet) ===== */}
      {tab === "candidates" && (
        <div>
          {/* Tre filtra: departamenti, kompania, statusi i aplikimit.
              flex-wrap → kalojnë në rresht të ri në ekrane të vogla. */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              value={candCategoryFilter}
              onChange={(e) => setCandCategoryFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Të gjitha departamentet</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={candCompanyFilter}
              onChange={(e) => setCandCompanyFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Të gjitha kompanitë</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>

            <select
              value={candStatusFilter}
              onChange={(e) => setCandStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Të gjitha statuset</option>
              <option value="pending">Në pritje</option>
              <option value="accepted">Pranuar</option>
              <option value="rejected">Refuzuar</option>
            </select>
          </div>

          {/* Lista e aplikimeve: kandidati, pozita, kompania, departamenti, statusi.
              key = application_id, sepse i njëjti kandidat mund të ketë disa aplikime. */}
          <div className="space-y-3">
            {candidates.map((c) => (
              <div key={c.application_id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{c.full_name}</p>
                    {/* Telefoni shfaqet vetëm nëse kandidati e ka plotësuar */}
                    <p className="text-sm text-gray-500">{c.email} {c.phone && `· ${c.phone}`}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {c.job_title} — {c.company_name} ({c.category_name || "—"})
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {appStatusLabels[c.status]}
                  </span>
                </div>
              </div>
            ))}
            {candidates.length === 0 && <p className="text-gray-500">Nuk u gjetën kandidatë me këto filtra.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// StatBar — komponent i vogël për një shirit statistikor.
// Merr: label (emri), value (vlera), max (vlera maksimale), color (ngjyra).
// Llogarit përqindjen dhe e vizaton si shirit me gjerësi sipas saj.
// I ripërdorshëm: përdoret 13 herë në skedën e statistikave,
// pa asnjë bibliotekë grafikësh.
// ============================================================
function StatBar({ label, value, max, color }) {
  // Përqindja: value / max × 100. Nëse max është 0, shiriti mbetet 0% (pa pjesëtim me zero).
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      {/* Rreshti sipër: emri majtas, numri djathtas */}
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      {/* Shiriti gri i plotë, dhe brenda tij pjesa me ngjyrë.
          style={{ width }} → gjerësia vendoset dinamikisht sipas përqindjes. */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
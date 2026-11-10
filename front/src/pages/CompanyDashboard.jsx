// ============================================================
// CompanyDashboard.jsx — Paneli i kompanisë ("Shpalljet e Mia")
// E përdor vetëm kompania. Shfaq të gjitha shpalljet e saj me statusin,
// lejon mbylljen dhe fshirjen, shfaq aplikantët e një shpalljeje
// dhe lejon ndryshimin e statusit të secilit aplikim.
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja
import { useEffect, useState } from "react";
// Link: lidhje mes faqeve pa rifreskuar shfletuesin
import { Link } from "react-router-dom";
// Funksionet që flasin me backend-in për shpalljet dhe aplikimet
import { getMyJobs, getApplicantsForJob, updateApplicationStatus, deleteJob, updateJob } from "../services/jobService";
// Kartat gri që shfaqen gjatë ngarkimit
import SkeletonCard from "../components/SkeletonCard";

export default function CompanyDashboard() {
  // ---------- GJENDJA (STATE) ----------
  const [jobs, setJobs] = useState([]);                    // shpalljet e kompanisë
  const [selectedJobId, setSelectedJobId] = useState(null); // shpallja që po shihen aplikantët (null = asnjë)
  const [applicants, setApplicants] = useState([]);        // aplikantët e shpalljes së zgjedhur
  const [loading, setLoading] = useState(true);            // true gjatë ngarkimit të shpalljeve

  // ---------- NGARKIMI I SHPALLJEVE ----------
  // Ekzekutohet VETËM NJË HERË kur hapet faqja ([] bosh)
  useEffect(() => {
    loadJobs();
  }, []);

  // Merr shpalljet e kompanisë nga GET /jobs/mine.php
  // (të gjitha statuset, bashkë me numrin e aplikantëve për secilën)
  async function loadJobs() {
    setLoading(true);
    try {
      const data = await getMyJobs();
      setJobs(data);
    } finally {
      setLoading(false); // fsheh kartat gri
    }
  }

  // ---------- FUNKSIONET ----------

  // Kur klikohet "Aplikantët (n)": ruan cilën shpallje zgjodhi kompania
  // dhe merr aplikantët e saj nga GET /applications/index.php?job_id=...
  async function viewApplicants(jobId) {
    setSelectedJobId(jobId);
    const data = await getApplicantsForJob(jobId);
    setApplicants(data);
  }

  // Kur kompania ndryshon statusin e një aplikimi te lista e zgjedhjes.
  // 1. Dërgon ndryshimin te PUT /applications/update_status.php
  //    (backend-i i dërgon email kandidatit kur statusi bëhet pranuar/refuzuar)
  // 2. Përditëson listën në ekran pa e marrë përsëri nga serveri:
  //    ndryshon vetëm aplikimin me këtë ID, të tjerët mbeten siç janë.
  async function handleStatusChange(applicationId, status) {
    await updateApplicationStatus(applicationId, status);
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
  }

  // Kur klikohet "Fshi"
  async function handleDeleteJob(jobId) {
    // confirm() hap dritaren "OK / Cancel". Nëse zgjidhet Cancel, ndalet këtu.
    if (!confirm("Je i sigurt që do ta fshish këtë shpallje?")) return;
    // DELETE /jobs/manage.php?id=...
    await deleteJob(jobId);
    // Heq shpalljen nga lista në ekran (filter mban të gjitha përveç kësaj)
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    // Nëse ishin hapur aplikantët e kësaj shpalljeje, mbyll edhe atë pjesë
    if (selectedJobId === jobId) setSelectedJobId(null);
  }

  // Kur klikohet "Mbyll": shpallja nuk pranon më aplikime të reja
  async function handleCloseJob(jobId) {
    if (!confirm("Ta mbyllësh këtë shpallje? S'do të pranojë më aplikime të reja.")) return;
    // PUT /jobs/manage.php?id=... me vetëm { status: "closed" };
    // fushat e tjera mbeten siç ishin.
    await updateJob(jobId, { status: "closed" });
    // Ndryshon statusin në ekran pa e marrë përsëri listën nga serveri
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "closed" } : j)));
  }

  // Përkthimi i statusit të aplikimit në shqip, për listën e zgjedhjes
  const statusLabels = {
    pending: "Në pritje",
    reviewed: "Shqyrtuar",
    accepted: "Pranuar",
    rejected: "Refuzuar",
  };

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 pb-16">
      {/* Titulli dhe butoni për shpallje të re (të çon te PostJob.jsx) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Shpalljet e Mia</h1>
        <Link to="/company/post-job" className="bg-indigo-600 text-white px-4 py-2 rounded">
          + Shpallje e Re
        </Link>
      </div>

      {/* ===== Lista e shpalljeve ===== */}
      {loading ? (
        <SkeletonCard count={3} />
      ) : (
        <div className="space-y-3 mb-8">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                {/* Majtas: të dhënat e shpalljes */}
                <div>
                  <h2 className="font-semibold">{job.title}</h2>
                  <p className="text-sm text-gray-500">
                    {job.location} · {job.employment_type} ·{" "}
                    {/* Ngjyra e statusit: e gjelbër = aprovuar, e verdhë = në pritje,
                        e kuqe = refuzuar, gri = mbyllur */}
                    <span className={
                      job.status === "approved" ? "text-green-600" :
                      job.status === "pending" ? "text-yellow-600" :
                      job.status === "rejected" ? "text-red-600" : "text-gray-400"
                    }>
                      {/* Objekt me tekstet e statusit; [job.status] zgjedh tekstin e duhur */}
                      {{
                        approved: "Aprovuar nga admini",
                        pending: "Në pritje të aprovimit",
                        rejected: "Refuzuar nga admini",
                        closed: "Mbyllur",
                      }[job.status]}
                    </span>
                  </p>
                  {/* Arsyeja e refuzimit nga administratori (admin_note),
                      shfaqet vetëm nëse shpallja është refuzuar dhe ka arsye */}
                  {job.status === "rejected" && job.admin_note && (
                    <p className="text-xs text-red-500 mt-1">Arsyeja: {job.admin_note}</p>
                  )}
                </div>

                {/* Djathtas: butonat e veprimeve */}
                <div className="flex gap-3 items-center">
                  {/* Shfaq aplikantët; numri vjen nga applicants_count te mine.php */}
                  <button
                    onClick={() => viewApplicants(job.id)}
                    className="text-sm text-indigo-600"
                  >
                    Aplikantët ({job.applicants_count})
                  </button>
                  {/* "Mbyll" shfaqet VETËM për shpalljet e aprovuara */}
                  {job.status === "approved" && (
                    <button
                      onClick={() => handleCloseJob(job.id)}
                      className="text-sm text-gray-600"
                    >
                      Mbyll
                    </button>
                  )}
                  {/* "Fshi" shfaqet për çdo shpallje */}
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-sm text-red-600"
                  >
                    Fshi
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Nëse kompania nuk ka asnjë shpallje → mesazh */}
          {jobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500">Ende s'ke krijuar asnjë shpallje.</p>
              <p className="text-sm text-gray-400 mt-1">Shtyp "+ Shpallje e Re" për të filluar.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== Aplikantët =====
          Shfaqet VETËM pasi kompania klikon "Aplikantët" te një shpallje */}
      {selectedJobId && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Aplikantët</h2>

          {/* Shpallja nuk ka ende aplikime */}
          {applicants.length === 0 && <p className="text-gray-500">Ende s'ka aplikime.</p>}

          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  {/* Majtas: të dhënat e kandidatit */}
                  <div>
                    <p className="font-medium">{a.full_name}</p>
                    <p className="text-sm text-gray-500">{a.email}</p>
                    {/* Titulli profesional, nëse kandidati e ka plotësuar */}
                    {a.headline && <p className="text-sm text-gray-600 mt-1">{a.headline}</p>}
                    {/* Letra e motivimit, nëse ka */}
                    {a.cover_letter && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{a.cover_letter}"</p>
                    )}
                    {/* Lidhja për CV-në: hap skedarin nga folderi uploads/ i backend-it.
                        target="_blank" → hapet në skedë të re
                        rel="noreferrer" → masë sigurie për lidhjet në skedë të re */}
                    {a.cv_path && (
                      <a
                        href={`http://localhost/jobconnect/backend/${a.cv_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-600 mt-2 inline-block"
                      >
                        Shiko CV-në
                      </a>
                    )}
                  </div>

                  {/* Djathtas: lista për ndryshimin e statusit të aplikimit.
                      Object.entries kthen statusLabels në çifte [vlera, teksti]
                      dhe për secilin krijohet një <option>.
                      Kur zgjidhet status i ri, thirret handleStatusChange. */}
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
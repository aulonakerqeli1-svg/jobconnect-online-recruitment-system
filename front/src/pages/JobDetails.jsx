// 
// JobDetails.jsx — Faqja e detajeve të një shpalljeje
// Adresa: /jobs/:id  (p.sh. /jobs/5)
// Shfaq të gjitha të dhënat e shpalljes. Nëse përdoruesi i kyçur
// është kandidat, shfaqet edhe formulari i aplikimit me CV.
//

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja
import { useEffect, useState } from "react";
// useParams: lexon pjesët e ndryshueshme të adresës (këtu :id)
import { useParams } from "react-router-dom";
// getJobById: merr një shpallje sipas ID-së
// applyToJob: dërgon aplikimin me CV te serveri
import { getJobById, applyToJob } from "../services/jobService";
// getCurrentUser: lexon përdoruesin e kyçur nga localStorage
import { getCurrentUser } from "../services/authService";

export default function JobDetails() {
  // Nga adresa /jobs/5 merr id = "5"
  const { id } = useParams();

  // ---------- GJENDJA (STATE) ----------
  const [job, setJob] = useState(null);                // shpallja (null derisa të vijë nga serveri)
  const [coverLetter, setCoverLetter] = useState("");  // teksti i letrës së motivimit
  const [cvFile, setCvFile] = useState(null);          // skedari i CV-së i zgjedhur
  const [message, setMessage] = useState("");          // mesazhi i suksesit
  const [error, setError] = useState("");              // mesazhi i gabimit
  const [applying, setApplying] = useState(false);     // true ndërsa dërgohet aplikimi

  // Përdoruesi i kyçur (ose null nëse askush nuk është kyçur).
  // Përdoret për të vendosur a shfaqet formulari i aplikimit.
  const user = getCurrentUser();

  // ---------- NGARKIMI I SHPALLJES ----------
  // Ekzekutohet kur hapet faqja dhe sa herë ndryshon id në adresë.
  // Merr shpalljen nga GET /jobs/show.php?id=5 dhe e ruan te job.
  useEffect(() => {
    getJobById(id).then(setJob);
  }, [id]);

  // ---------- APLIKIMI ----------
  // Thirret kur kandidati klikon "Apliko"
  async function handleApply(e) {
    e.preventDefault(); // ndalon rifreskimin e faqes
    setError("");       // fshin mesazhet e mëparshme
    setMessage("");
    setApplying(true);  // çaktivizon butonin gjatë dërgimit

    try {
      // Dërgon aplikimin si FormData (tekst + skedar) te POST /applications/index.php.
      // Backend-i kontrollon: a është kandidat, a është shpallja e miratuar,
      // a ka aplikuar më parë (UNIQUE KEY), tipin dhe madhësinë e CV-së.
      await applyToJob(id, { coverLetter, cvFile });
      setMessage("Aplikimi u dërgua me sukses!");
    } catch (err) {
      // P.sh. "Keni aplikuar tashmë për këtë pozitë" ose gabim në CV
      setError(err.response?.data?.error || "Aplikimi dështoi.");
    } finally {
      setApplying(false); // riaktivizon butonin
    }
  }

  // Derisa shpallja të vijë nga serveri, shfaq vetëm këtë tekst
  if (!job) return <p className="text-center mt-10">Duke ngarkuar...</p>;

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {/* ===== Karta me detajet e shpalljes ===== */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-semibold">{job.title}</h1>
        <p className="text-gray-600">{job.company_name} · {job.location}</p>
        <p className="text-sm text-gray-500 mt-1">
          {job.employment_type}
          {/* Paga shfaqet vetëm nëse kompania e ka vendosur */}
          {job.salary_min && ` · ${job.salary_min}€ - ${job.salary_max}€`}
        </p>

        <h2 className="font-semibold mt-6 mb-2">Përshkrimi</h2>
        {/* whitespace-pre-line → ruan kalimet në rresht të reja ashtu siç i shkroi kompania */}
        <p className="text-gray-700 whitespace-pre-line">{job.description}</p>

        {/* Kërkesat shfaqen vetëm nëse ekzistojnë.
            <> ... </> = fragment: grupon elemente pa shtuar <div> shtesë */}
        {job.requirements && (
          <>
            <h2 className="font-semibold mt-6 mb-2">Kërkesat</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
          </>
        )}
      </div>

      {/* ===== Formulari i aplikimit =====
          Shfaqet VETËM nëse përdoruesi i kyçur është kandidat.
          user?.role → nëse user është null (askush i kyçur), nuk prishet.
          Kompania dhe administratori nuk e shohin këtë formular.
          (Backend-i e kontrollon rolin përsëri, sepse ky kusht mund të anashkalohet.) */}
      {user?.role === "candidate" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Apliko për këtë pozitë</h2>

          {/* Mesazhet e suksesit dhe të gabimit */}
          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleApply} className="space-y-4">
            {/* Letra e motivimit: opsionale */}
            <div>
              <label className="block text-sm font-medium mb-1">Letër motivimi (opsionale)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* Ngarkimi i CV-së.
                type="file" → hap dritaren për zgjedhjen e skedarit
                accept → në dritare shfaqen vetëm PDF dhe Word
                e.target.files[0] → skedari i parë (dhe i vetëm) i zgjedhur */}
            <div>
              <label className="block text-sm font-medium mb-1">CV (PDF ose Word)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files[0])}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* Butoni çaktivizohet gjatë dërgimit që të mos aplikohet dy herë */}
            <button
              type="submit"
              disabled={applying}
              className="w-full bg-indigo-600 text-white py-2 rounded transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {applying ? "Duke dërguar..." : "Apliko"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
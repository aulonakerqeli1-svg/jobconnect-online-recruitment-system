// ============================================================
// jobService.js — Shërbimi i shpalljeve dhe aplikimeve
// Këtu janë të gjitha funksionet që flasin me backend-in për
// shpalljet e punës, kategoritë dhe aplikimet.
// Faqet (JobsList, PostJob, CompanyDashboard...) i thërrasin këto
// funksione në vend që të shkruajnë vetë kërkesat HTTP.
// ============================================================

// api: Axios-i i konfiguruar te axios.js (baseURL + token automatik)
import api from "../api/axios";

// ---------- SHPALLJET ----------

// Merr listën publike të shpalljeve (vetëm ato të miratuara).
// filters = objekt me kriteret e kërkimit, p.sh. { search: "React", location: "Pejë", page: 2 }
// = {} → nëse nuk jepen filtra, përdoret objekt bosh (merren të gjitha)
export async function getJobs(filters = {}) {
  // URLSearchParams e kthen objektin në tekst për adresën:
  // { search: "React", page: 2 } → "search=React&page=2"
  const params = new URLSearchParams(filters).toString();
  // GET te /jobs/index.php?search=React&page=2
  const res = await api.get(`/jobs/index.php?${params}`);
  return res.data; // lista e shpalljeve (dhe të dhënat e paginimit)
}

// Merr detajet e një shpalljeje të vetme sipas ID-së
// (përdoret te faqja e detajeve, kur kandidati klikon një shpallje)
export async function getJobById(id) {
  const res = await api.get(`/jobs/show.php?id=${id}`);
  return res.data;
}

// Krijon një shpallje të re (vetëm kompania).
// Përdoret te PostJob.jsx. Backend-i i vendos statusin "pending".
export async function createJob(jobData) {
  // POST te /jobs/index.php me të dhënat e formularit në JSON
  const res = await api.post("/jobs/index.php", jobData);
  return res.data;
}

// Përditëson një shpallje ekzistuese (vetëm kompania pronare).
// PUT = metoda HTTP për ndryshimin e të dhënave ekzistuese
export async function updateJob(id, jobData) {
  const res = await api.put(`/jobs/manage.php?id=${id}`, jobData);
  return res.data;
}

// Fshin një shpallje (vetëm kompania pronare).
// DELETE = metoda HTTP për fshirje
export async function deleteJob(id) {
  const res = await api.delete(`/jobs/manage.php?id=${id}`);
  return res.data;
}

// Merr të gjitha shpalljet e kompanisë së kyçur, me çdo status
// (pending, approved, rejected, closed). Përdoret te CompanyDashboard.
// Backend-i e di cila kompani është nga token-i, prandaj nuk dërgohet ID.
export async function getMyJobs() {
  const res = await api.get("/jobs/mine.php");
  return res.data;
}

// ---------- KATEGORITË ----------

// Merr listën e kategorive/departamenteve nga tabela job_categories.
// Përdoret për listat e zgjedhjes te PostJob dhe te filtrimi.
export async function getCategories() {
  const res = await api.get("/categories/index.php");
  return res.data;
}

// ---------- APLIKIMET ----------

// Kandidati aplikon në një shpallje me CV dhe letër motivimi.
// Skedarët (CV) nuk mund të dërgohen si JSON, prandaj përdoret FormData.
export async function applyToJob(jobId, { coverLetter, cvFile }) {
  // FormData = "pako" që mban edhe tekst, edhe skedarë
  const formData = new FormData();
  formData.append("job_id", jobId);                              // në cilën shpallje aplikon
  if (coverLetter) formData.append("cover_letter", coverLetter); // letra e motivimit (opsionale)
  if (cvFile) formData.append("cv", cvFile);                     // skedari i CV-së (PDF/Word)

  // multipart/form-data = formati i dërgimit kur ka skedarë
  const res = await api.post("/applications/index.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Merr aplikimet e kandidatit të kyçur (faqja "Aplikimet e Mia").
// Backend-i e njeh kandidatin nga token-i.
export async function getMyApplications() {
  const res = await api.get("/applications/index.php");
  return res.data;
}

// Merr aplikantët për një shpallje të caktuar.
// Lejohet vetëm për kompaninë që e ka krijuar shpalljen (kontrollohet në backend).
// I njëjti endpoint si më sipër, por me ?job_id=, kthen të dhëna të ndryshme.
export async function getApplicantsForJob(jobId) {
  const res = await api.get(`/applications/index.php?job_id=${jobId}`);
  return res.data;
}

// Kompania ndryshon statusin e një aplikimi:
// "pending" (në pritje), "reviewed" (shqyrtuar), "accepted" (pranuar), "rejected" (refuzuar).
// Kur statusi bëhet pranuar/refuzuar, backend-i i dërgon email kandidatit.
export async function updateApplicationStatus(applicationId, status) {
  const res = await api.put(`/applications/update_status.php?id=${applicationId}`, { status });
  return res.data;
}
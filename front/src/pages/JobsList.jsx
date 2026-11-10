// ============================================================
// JobsList.jsx — Lista publike e shpalljeve të punës
// Shfaq shpalljet e miratuara, me kërkim, filtrim dhe paginim
// (10 shpallje për faqe). Kandidati klikon një shpallje për detajet.
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja ose kur ndryshon diçka
import { useEffect, useState } from "react";
// Link: lidhje mes faqeve pa rifreskuar shfletuesin
import { Link } from "react-router-dom";
// getJobs: merr shpalljet nga serveri sipas filtrave
// getCategories: merr listën e departamenteve
import { getJobs, getCategories } from "../services/jobService";
// Kartat gri që shfaqen gjatë ngarkimit
import SkeletonCard from "../components/SkeletonCard";

export default function JobsList() {
  // ---------- GJENDJA (STATE) ----------

  // Të dhënat që vijnë nga serveri
  const [jobs, setJobs] = useState([]);             // lista e shpalljeve të faqes aktuale
  const [categories, setCategories] = useState([]); // lista e departamenteve për filtrin

  // Vlerat e filtrave që shkruan/zgjedh përdoruesi
  const [search, setSearch] = useState("");         // teksti i kërkimit
  const [location, setLocation] = useState("");     // qyteti
  const [categoryId, setCategoryId] = useState(""); // ID e departamentit ("" = të gjitha)

  // Paginimi
  const [page, setPage] = useState(1);              // faqja aktuale
  const [totalPages, setTotalPages] = useState(1);  // sa faqe ka gjithsej (vjen nga serveri)
  const [loading, setLoading] = useState(true);     // true që në fillim, sepse faqja ngarkon menjëherë

  // ---------- EFEKTET (useEffect) ----------

  // 1. Ekzekutohet VETËM NJË HERË kur hapet faqja ([] bosh):
  //    merr departamentet për listën e zgjedhjes.
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // 2. Ekzekutohet kur hapet faqja DHE sa herë ndryshon "page"
  //    (kur klikohet "Para" ose "Prapa"): merr shpalljet e asaj faqeje.
  useEffect(() => {
    fetchJobs();
  }, [page]);

  // ---------- FUNKSIONET ----------

  // Merr shpalljet nga serveri sipas filtrave dhe faqes.
  // Thirret në dy raste:
  //   - nga formulari (butoni "Kërko") → vjen me "e" (ngjarja e formularit)
  //   - nga useEffect (ndryshim faqeje) → vjen pa "e"
  async function fetchJobs(e) {
    if (e) e.preventDefault(); // nëse vjen nga formulari, ndalo rifreskimin e faqes
    setPage(1);                // kthen faqen te 1 (shih vërejtjen më poshtë)
    setLoading(true);          // shfaq kartat gri
    try {
      // Dërgon filtrat te backend-i: GET /jobs/index.php?search=...&location=...
      const result = await getJobs({
        search,
        location,
        category_id: categoryId,
        page: e ? 1 : page, // kërkim i ri → faqja 1; ndryshim faqeje → faqja aktuale
        limit: 10,          // 10 shpallje për faqe
      });
      setJobs(result.data);               // shpalljet e kësaj faqeje
      setTotalPages(result.total_pages);  // numri total i faqeve
    } finally {
      // finally ekzekutohet gjithmonë: fshih kartat gri
      setLoading(false);
    }
  }

  // Butoni "Pastro": zbraz të gjitha fushat e filtrave
  // dhe kthen paginimin te faqja e parë.
  function clearFilters() {
    setSearch("");
    setLocation("");
    setCategoryId("");
    setPage(1);
  }

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Shpalljet e Punës</h1>

      {/* Formulari i kërkimit dhe filtrimit.
          Kur klikohet "Kërko" (ose shtypet Enter), thirret fetchJobs. */}
      <form onSubmit={fetchJobs} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
        {/* Kërkim me tekst të lirë sipas titullit */}
        <input
          type="text"
          placeholder="Kërko sipas titullit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Filtri i qytetit: fushë teksti e lirë */}
          <input
            type="text"
            placeholder="Qyteti (p.sh. Prishtinë)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border rounded px-3 py-2"
          />

          {/* Filtri i departamentit: lista mbushet nga serveri (tabela job_categories) */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Të gjitha departamentet</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {/* type="submit" → dërgon formularin → fetchJobs */}
          <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded transition-colors hover:bg-indigo-700">
            Kërko
          </button>
          {/* type="button" → NUK dërgon formularin, vetëm thërret clearFilters */}
          <button type="button" onClick={clearFilters} className="px-4 py-2 border rounded text-sm text-gray-600">
            Pastro
          </button>
        </div>
      </form>

      {/* Nëse po ngarkohet → kartat gri; përndryshe → lista e shpalljeve */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : (
        <div className="space-y-4">
          {/* Për çdo shpallje krijohet një kartë që klikohet.
              Link të çon te faqja e detajeve: /jobs/5 për shpalljen me ID 5 */}
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg">{job.title}</h2>
              <p className="text-gray-600">{job.company_name} · {job.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                {job.employment_type}
                {/* Departamenti shfaqet vetëm nëse shpallja ka kategori */}
                {job.category_name && ` · ${job.category_name}`}
              </p>
            </Link>
          ))}

          {/* Nëse serveri ktheu listë bosh → mesazh në vend të faqes së zbrazët */}
          {jobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500">Nuk u gjetën shpallje.</p>
              <p className="text-sm text-gray-400 mt-1">Provo një kërkim tjetër ose kthehu më vonë.</p>
            </div>
          )}
        </div>
      )}

      {/* ---------- PAGINIMI ----------
          Ndryshimi i "page" e ndez useEffect-in e dytë, i cili merr faqen e re. */}
      <div className="flex justify-center gap-2 mt-6">
        {/* "Prapa" çaktivizohet në faqen e parë */}
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prapa
        </button>
        {/* P.sh. "2 / 5" */}
        <span className="px-3 py-1">{page} / {totalPages}</span>
        {/* "Para" çaktivizohet në faqen e fundit */}
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Para
        </button>
      </div>
    </div>
  );
}
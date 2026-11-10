// ============================================================
// PostJob.jsx — Faqja për krijimin e një shpalljeje të re pune
// E përdor vetëm kompania. Pas dërgimit, shpallja ruhet me statusin
// "pending" (në pritje) dhe del publikisht vetëm pasi ta miratojë administratori.
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja
import { useEffect, useState } from "react";
// useNavigate: për ta dërguar përdoruesin në një faqe tjetër me kod
import { useNavigate } from "react-router-dom";
// createJob: dërgon shpalljen e re te backend-i
// getCategories: merr listën e kategorive/departamenteve nga backend-i
import { createJob, getCategories } from "../services/jobService";

export default function PostJob() {
  // ---------- GJENDJA (STATE) ----------

  // Lista e kategorive që vjen nga serveri (fillimisht bosh)
  const [categories, setCategories] = useState([]);

  // Të dhënat e formularit të shpalljes.
  // Fusha "status" NUK është këtu: kompania nuk mund ta zgjedhë vetë statusin.
  // Backend-i ia vendos automatikisht "pending".
  const [form, setForm] = useState({
    title: "",                     // titulli i pozitës
    description: "",               // përshkrimi i punës
    requirements: "",              // kërkesat për kandidatin
    location: "",                  // qyteti / lokacioni
    employment_type: "full-time",  // lloji i punësimit (parazgjedhja: full-time)
    category_id: "",               // ID e kategorisë së zgjedhur
    salary_min: "",                // paga minimale
    salary_max: "",                // paga maksimale
    deadline: "",                  // afati i aplikimit
  });
  const [error, setError] = useState("");        // mesazhi i gabimit
  const [loading, setLoading] = useState(false); // true ndërsa pritet serveri
  const navigate = useNavigate();

  // ---------- NGARKIMI I KATEGORIVE ----------
  // useEffect me [] në fund ekzekutohet VETËM NJË HERË, kur hapet faqja.
  // Merr kategoritë nga databaza (tabela job_categories) dhe i ruan te categories,
  // që të shfaqen te lista "Kategoria" më poshtë.
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // ---------- FUNKSIONET ----------

  // Thirret sa herë përdoruesi shkruan ose zgjedh diçka.
  // Përditëson vetëm fushën që u ndryshua, sipas atributit name.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Thirret kur klikohet "Publiko Shpalljen"
  async function handleSubmit(e) {
    e.preventDefault(); // ndalon rifreskimin e faqes
    setError("");       // fshin gabimin e mëparshëm
    setLoading(true);   // çaktivizon butonin gjatë pritjes

    try {
      // Dërgon shpalljen te backend-i (POST /jobs/index.php)
      // dhe pret përgjigjen
      await createJob(form);
      // Nëse pati sukses, kthen kompaninë te paneli i saj,
      // ku shpallja e re shfaqet me statusin "në pritje"
      navigate("/company/dashboard");
    } catch (err) {
      // Nëse serveri ktheu gabim, shfaq mesazhin e tij
      // ose mesazhin e përgjithshëm nëse nuk ka përgjigje
      setError(err.response?.data?.error || "Krijimi i shpalljes dështoi.");
    } finally {
      // finally ekzekutohet GJITHMONË, si në sukses ashtu edhe në gabim:
      // riaktivizon butonin
      setLoading(false);
    }
  }

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Krijo Shpallje të Re</h1>

      {/* Kutia e kuqe shfaqet VETËM nëse ka gabim */}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        {/* Titulli: i detyrueshëm (required) */}
        <div>
          <label className="block text-sm font-medium mb-1">Titulli</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Përshkrimi: textarea = fushë teksti me disa rreshta (4 rreshta) */}
        <div>
          <label className="block text-sm font-medium mb-1">Përshkrimi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Kërkesat: opsionale (pa required) */}
        <div>
          <label className="block text-sm font-medium mb-1">Kërkesat</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Dy fusha në një rresht (grid me 2 kolona) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Lokacioni: fushë teksti e lirë */}
          <div>
            <label className="block text-sm font-medium mb-1">Lokacioni</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Lloji i punësimit: listë me vlera të paracaktuara.
              value → ajo që ruhet në databazë; teksti → ajo që sheh përdoruesi */}
          <div>
            <label className="block text-sm font-medium mb-1">Lloji i punësimit</label>
            <select
              name="employment_type"
              value={form.employment_type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Praktikë</option>
              <option value="remote">Remote</option>
              <option value="contract">Kontratë</option>
            </select>
          </div>
        </div>

        {/* Kategoria: lista mbushet dinamikisht nga serveri.
            Për çdo kategori krijohet një <option>; ruhet ID-ja (category_id),
            ndërsa përdoruesi sheh emrin. */}
        <div>
          <label className="block text-sm font-medium mb-1">Kategoria</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">— Zgjidh —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Intervali i pagës: type="number" lejon vetëm numra */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rroga min (€)</label>
            <input
              type="number"
              name="salary_min"
              value={form.salary_min}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rroga max (€)</label>
            <input
              type="number"
              name="salary_max"
              value={form.salary_max}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Afati: type="date" hap kalendarin e shfletuesit */}
        <div>
          <label className="block text-sm font-medium mb-1">Afati (deadline)</label>
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Butoni: çaktivizohet gjatë pritjes që të mos krijohen dy shpallje */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Duke ruajtur..." : "Publiko Shpalljen"}
        </button>
      </form>
    </div>
  );
}
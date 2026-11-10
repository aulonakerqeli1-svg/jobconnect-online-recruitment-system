// ============================================================
// CompanyProfile.jsx — Faqja e profilit të kompanisë
// E përdor vetëm kompania. Kur hapet, mbush formularin me të dhënat
// ekzistuese nga databaza; kompania i ndryshon dhe i ruan.
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja
import { useEffect, useState } from "react";
// getMyCompanyProfile: merr profilin e kompanisë së kyçur
// updateMyCompanyProfile: ruan ndryshimet e profilit
import { getMyCompanyProfile, updateMyCompanyProfile } from "../services/companyService";

export default function CompanyProfile() {
  // ---------- GJENDJA (STATE) ----------

  // Të dhënat e formularit (fillimisht bosh, mbushen nga serveri)
  const [form, setForm] = useState({
    company_name: "", description: "", website: "", location: "", industry: "",
  });
  const [loading, setLoading] = useState(true);  // true derisa të vijë profili nga serveri
  const [saving, setSaving] = useState(false);   // true ndërsa ruhen ndryshimet
  const [message, setMessage] = useState("");    // mesazhi i suksesit

  // ---------- NGARKIMI I PROFILIT ----------
  // Ekzekutohet VETËM NJË HERË kur hapet faqja ([] bosh).
  // GET /companies/profile.php → backend-i e njeh kompaninë nga token-i.
  useEffect(() => {
    getMyCompanyProfile().then((data) => {
      // Mbush formularin me të dhënat ekzistuese.
      // || "" → nëse fusha në databazë është bosh (null), përdor tekst bosh,
      // sepse fushat e kontrolluara në React nuk duhet të marrin null.
      setForm({
        company_name: data.company_name || "",
        description: data.description || "",
        website: data.website || "",
        location: data.location || "",
        industry: data.industry || "",
      });
      setLoading(false); // shfaq formularin
    });
  }, []);

  // ---------- FUNKSIONET ----------

  // Thirret sa herë kompania shkruan në një fushë.
  // Përditëson vetëm fushën që u ndryshua, sipas atributit name.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Thirret kur klikohet "Ruaj Profilin"
  async function handleSubmit(e) {
    e.preventDefault(); // ndalon rifreskimin e faqes
    setSaving(true);    // çaktivizon butonin gjatë ruajtjes
    setMessage("");     // fshin mesazhin e mëparshëm
    try {
      // PUT /companies/profile.php me të dhënat e reja
      await updateMyCompanyProfile(form);
      setMessage("Profili u ruajt me sukses.");
    } finally {
      // finally ekzekutohet gjithmonë: riaktivizon butonin
      setSaving(false);
    }
  }

  // Derisa profili të vijë nga serveri, shfaq vetëm këtë tekst
  if (loading) return <p className="text-center mt-10">Duke ngarkuar...</p>;

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Profili i Kompanisë</h1>

      {/* Kutia e gjelbër shfaqet VETËM pas ruajtjes së suksesshme */}
      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        {/* Emri i kompanisë: i detyrueshëm (required).
            Gjatë regjistrimit merr emrin e dhënë atje; këtu mund të ndryshohet. */}
        <div>
          <label className="block text-sm font-medium mb-1">Emri i kompanisë</label>
          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Përshkrimi i kompanisë: fushë teksti me disa rreshta */}
        <div>
          <label className="block text-sm font-medium mb-1">Përshkrimi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Dy fusha në një rresht (grid me 2 kolona) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Faqja web: placeholder tregon formën e pritur */}
          <div>
            <label className="block text-sm font-medium mb-1">Faqja web</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
          {/* Industria: tekst i lirë */}
          <div>
            <label className="block text-sm font-medium mb-1">Industria</label>
            <input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="p.sh. IT, Bukuri, Financa"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Lokacioni i kompanisë: tekst i lirë */}
        <div>
          <label className="block text-sm font-medium mb-1">Lokacioni</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Butoni çaktivizohet gjatë ruajtjes që të mos klikohet dy herë */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-2 rounded transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Duke ruajtur..." : "Ruaj Profilin"}
        </button>
      </form>
    </div>
  );
}
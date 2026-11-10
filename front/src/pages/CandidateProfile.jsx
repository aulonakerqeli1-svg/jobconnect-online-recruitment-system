// ============================================================
// CandidateProfile.jsx — Faqja "Profili Im" e kandidatit
// Kur hapet, mbush formularin me të dhënat ekzistuese nga databaza.
// Kandidati mund të ngarkojë foto profili dhe të ndryshojë të dhënat.
// Fotoja ngarkohet MENJËHERË kur zgjidhet; pjesa tjetër ruhet me butonin.
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja
import { useEffect, useState } from "react";
// getMyProfile: merr profilin e kandidatit të kyçur
// updateMyProfile: ruan ndryshimet e profilit
// uploadMyPhoto: ngarkon foton e profilit
import { getMyProfile, updateMyProfile, uploadMyPhoto } from "../services/candidateService";

export default function CandidateProfile() {
  // ---------- GJENDJA (STATE) ----------

  // Të dhënat e formularit (fillimisht bosh, mbushen nga serveri)
  const [form, setForm] = useState({
    headline: "", bio: "", skills: "", experience: "",
    phone: "", personal_number: "", location: "",
  });
  const [photoPath, setPhotoPath] = useState(null);         // rruga e fotos së ruajtur në server
  const [photoFile, setPhotoFile] = useState(null);         // skedari i fotos që sapo u zgjodh
  const [loading, setLoading] = useState(true);             // true derisa të vijë profili
  const [saving, setSaving] = useState(false);              // true ndërsa ruhet profili
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // true ndërsa ngarkohet fotoja
  const [message, setMessage] = useState("");               // mesazhi për përdoruesin

  // ---------- NGARKIMI I PROFILIT ----------
  // Ekzekutohet VETËM NJË HERË kur hapet faqja ([] bosh).
  // GET /candidates/profile.php → backend-i e njeh kandidatin nga token-i.
  useEffect(() => {
    getMyProfile().then((data) => {
      // Mbush formularin me të dhënat ekzistuese.
      // || "" → nëse fusha në databazë është bosh (null), përdor tekst bosh,
      // sepse fushat e kontrolluara në React nuk duhet të marrin null.
      setForm({
        headline: data.headline || "",
        bio: data.bio || "",
        skills: data.skills || "",
        experience: data.experience || "",
        phone: data.phone || "",
        personal_number: data.personal_number || "",
        location: data.location || "",
      });
      setPhotoPath(data.photo_path || null); // fotoja ekzistuese (nëse ka)
      setLoading(false);                      // shfaq formularin
    });
  }, []);

  // ---------- FUNKSIONET ----------

  // Thirret sa herë kandidati shkruan në një fushë.
  // Përditëson vetëm fushën që u ndryshua, sipas atributit name.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Thirret sapo kandidati zgjedh një foto.
  // Fotoja ngarkohet menjëherë, pa pritur butonin "Ruaj Profilin".
  async function handlePhotoChange(e) {
    const file = e.target.files[0]; // skedari i zgjedhur
    if (!file) return;              // nëse u anulua zgjedhja, mos bëj asgjë
    setPhotoFile(file);             // për ta shfaqur menjëherë si parapamje
    setUploadingPhoto(true);        // shfaq "Duke ngarkuar..."
    try {
      // POST /candidates/upload_photo.php (FormData me foton).
      // Backend-i kontrollon tipin (JPG/PNG/WEBP) dhe madhësinë (deri 2 MB).
      const result = await uploadMyPhoto(file);
      setPhotoPath(result.photo_path); // ruan rrugën e re që ktheu serveri
      setMessage("Fotoja u ngarkua me sukses.");
    } catch (err) {
      // P.sh. skedar shumë i madh ose tip i palejuar
      setMessage(err.response?.data?.error || "Ngarkimi i fotos dështoi.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Thirret kur klikohet "Ruaj Profilin"
  async function handleSubmit(e) {
    e.preventDefault(); // ndalon rifreskimin e faqes
    setSaving(true);    // çaktivizon butonin gjatë ruajtjes
    setMessage("");
    try {
      // PUT /candidates/profile.php me të dhënat e reja (pa foton)
      await updateMyProfile(form);
      setMessage("Profili u ruajt me sukses.");
    } finally {
      setSaving(false); // riaktivizon butonin
    }
  }

  // Derisa profili të vijë nga serveri, shfaq vetëm këtë tekst
  if (loading) return <p className="text-center mt-10">Duke ngarkuar...</p>;

  // Cila foto të shfaqet:
  // 1. Nëse sapo u zgjodh një foto → parapamje lokale nga kompjuteri
  //    (URL.createObjectURL krijon një adresë të përkohshme për skedarin)
  // 2. Përndryshe, nëse ka foto të ruajtur → nga folderi uploads/ i backend-it
  // 3. Përndryshe → null (shfaqet ikona 👤)
  const photoUrl = photoFile
    ? URL.createObjectURL(photoFile)
    : photoPath
    ? `http://localhost/jobconnect/backend/${photoPath}`
    : null;

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Profili Im</h1>

      {/* Mesazhi shfaqet vetëm nëse ka diçka për të thënë */}
      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

      {/* ===== Fotoja e profilit ===== */}
      <div className="bg-white p-6 rounded-xl shadow mb-4 flex items-center gap-4">
        {/* Rrethi me foto: rounded-full = rreth; object-cover = fotoja mbush rrethin pa u deformuar */}
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="Foto profili" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-2xl">👤</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Foto profili</label>
          {/* accept → në dritaren e zgjedhjes shfaqen vetëm JPG, PNG dhe WEBP.
              onChange → thërret handlePhotoChange sapo zgjidhet skedari */}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            {uploadingPhoto ? "Duke ngarkuar..." : "JPG, PNG ose WEBP, deri 2MB."}
          </p>
        </div>
      </div>

      {/* ===== Formulari i profilit ===== */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        {/* Titulli profesional: shfaqet te kompania kur sheh aplikantët (headline) */}
        <div>
          <label className="block text-sm font-medium mb-1">Titulli profesional</label>
          <input
            name="headline"
            value={form.headline}
            onChange={handleChange}
            placeholder="p.sh. Junior Frontend Developer"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Dy fusha në një rresht (grid me 2 kolona) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Numri i telefonit</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+383 4X XXX XXX"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          {/* Numri personal: e dhënë e ndjeshme, ruhet pa enkriptim shtesë (kufizim i njohur) */}
          <div>
            <label className="block text-sm font-medium mb-1">Numri personal</label>
            <input
              name="personal_number"
              value={form.personal_number}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Lokacioni: tekst i lirë */}
        <div>
          <label className="block text-sm font-medium mb-1">Lokacioni</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Aftësitë: fushë teksti me disa rreshta */}
        <div>
          <label className="block text-sm font-medium mb-1">Aftësitë</label>
          <textarea
            name="skills"
            value={form.skills}
            onChange={handleChange}
            rows={2}
            placeholder="React, PHP, MySQL, ..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Eksperienca e punës */}
        <div>
          <label className="block text-sm font-medium mb-1">Eksperienca</label>
          <textarea
            name="experience"
            value={form.experience}
            onChange={handleChange}
            rows={4}
            placeholder="Përshkruaj punët/praktikat e mëparshme..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Përshkrim i shkurtër personal */}
        <div>
          <label className="block text-sm font-medium mb-1">Rreth meje (bio)</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
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
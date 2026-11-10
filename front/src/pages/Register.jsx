// ============================================================
// Register.jsx — Faqja e regjistrimit
// Përdoruesi krijon llogari si Kandidat ose si Kompani.
// Të dhënat validohen këtu (frontend) dhe pastaj dërgohen
// te backend-i përmes authService → axios → auth/register.php.
// ============================================================

// useState: "kujtesa" e komponentit; kur ndryshon, faqja rivizatohet
import { useState } from "react";
// useNavigate: për të kaluar në një faqe tjetër me kod
// Link: lidhje mes faqeve pa rifreskuar shfletuesin
import { useNavigate, Link } from "react-router-dom";
// Funksioni që dërgon të dhënat te serveri dhe ruan sesionin (token + user)
import { register } from "../services/authService";

// Rregulli për formën e email-it:
// diçka pa hapësirë + "@" + diçka + "." + diçka  (p.sh. emri@shembull.com)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  // ---------- GJENDJA (STATE) ----------

  // Të dhënat e formularit. Roli fillon si "candidate".
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "candidate",
  });
  // Mesazhi i gabimit (kutia e kuqe). Bosh = nuk ka gabim.
  const [error, setError] = useState("");
  // Mesazhi i suksesit (kutia e gjelbër)
  const [success, setSuccess] = useState("");
  // true ndërsa kërkesa është duke u dërguar te serveri
  const [loading, setLoading] = useState(false);
  // Funksioni për ridrejtim në një faqe tjetër
  const navigate = useNavigate();

  // ---------- FUNKSIONET ----------

  // Thirret sa herë përdoruesi shkruan në një fushë.
  // ...form  → mbaj të gjitha fushat e tjera siç janë
  // [e.target.name] → përditëso vetëm fushën që u ndryshua (sipas atributit name)
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Kontrollon të dhënat para dërgimit.
  // Kthen mesazhin e gabimit të parë që gjen, ose null nëse çdo gjë është në rregull.
  function validate() {
    // 1. Emri nuk duhet të jetë bosh (trim heq hapësirat në fillim dhe në fund)
    if (!form.full_name.trim()) {
      return "Emri i plotë është i detyrueshëm.";
    }
    // 2. Email-i duhet të ketë formën e duhur
    if (!EMAIL_REGEX.test(form.email)) {
      return "Fut një adresë email valide (p.sh. emri@shembull.com).";
    }
    // 3. Fjalëkalimi duhet të ketë të paktën 6 karaktere
    if (form.password.length < 6) {
      return "Fjalëkalimi duhet të ketë të paktën 6 karaktere.";
    }
    // 4. Fjalëkalimi duhet të ketë të paktën një shkronjë DHE të paktën një numër
    if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return "Fjalëkalimi duhet të ketë të paktën një shkronjë dhe një numër.";
    }
    // 5. Dy fjalëkalimet duhet të jenë të njëjta
    if (form.password !== form.confirmPassword) {
      return "Fjalëkalimet nuk përputhen.";
    }
    // Asnjë gabim
    return null;
  }

  // Thirret kur klikohet butoni "Regjistrohu".
  // async → brenda tij mund të presim (await) përgjigjen e serverit.
  async function handleSubmit(e) {
    // Ndalon rifreskimin e faqes, që është sjellja e zakonshme e formularit
    e.preventDefault();
    // Fshin mesazhet nga tentativa e mëparshme
    setError("");
    setSuccess("");

    // Validimi në frontend. Nëse ka gabim, e shfaqim dhe ndalemi:
    // serverit nuk i dërgohet asgjë.
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Butoni çaktivizohet dhe shfaq "Duke u regjistruar..."
    setLoading(true);
    try {
      // Heqim confirmPassword nga të dhënat, sepse serverit nuk i duhet.
      // payload = { full_name, email, password, role }
      const { confirmPassword, ...payload } = form;

      // Dërgon të dhënat te auth/register.php dhe pret përgjigjen.
      // register() e ruan edhe token-in dhe user-in në localStorage,
      // prandaj pas regjistrimit përdoruesi është menjëherë i kyçur.
      const data = await register(payload);

      setSuccess("Regjistrimi u krye me sukses! Duke të ridrejtuar...");

      // Zgjedh faqen sipas rolit: kompania te paneli, kandidati te shpalljet
      const dest = data.user.role === "company" ? "/company/dashboard" : "/jobs";
      // Pret 0.8 sekonda që të lexohet mesazhi, pastaj ridrejton
      setTimeout(() => navigate(dest), 800);
    } catch (err) {
      // Nëse serveri ktheu gabim (p.sh. email-i ekziston), shfaqim mesazhin e tij.
      // ?. → mos u prish nëse s'ka përgjigje fare (p.sh. serveri i fikur);
      // atëherë shfaqet mesazhi i përgjithshëm pas ||.
      setError(err.response?.data?.error || "Regjistrimi dështoi. Provo përsëri.");
      // Aktivizojmë prapë butonin që përdoruesi të provojë përsëri
      setLoading(false);
    }
  }

  // ---------- PAMJA (JSX) ----------
  return (
    // Kutia kryesore: e bardhë, në qendër, me hije (klasa Tailwind CSS)
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">Regjistrohu</h1>

      {/* Kutia e kuqe shfaqet VETËM nëse ka gabim */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {/* Kutia e gjelbër shfaqet VETËM pas suksesit */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      {/* Kur dërgohet formulari, thirret handleSubmit */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fusha: Emri i plotë.
            value → vlera vjen nga state (fushë e kontrolluar)
            onChange → çdo shkronjë kalon te handleChange
            name → duhet të jetë i njëjtë me çelësin te form */}
        <div>
          <label className="block text-sm font-medium mb-1">Emri i plotë</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Fusha: Email. type="email" → shfletuesi bën edhe një kontroll bazë */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="emri@shembull.com"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Fusha: Fjalëkalimi. type="password" → shkronjat fshihen me pika */}
        <div>
          <label className="block text-sm font-medium mb-1">Fjalëkalimi</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2"
          />
          {/* Udhëzim i vogël nën fushë */}
          <p className="text-xs text-gray-400 mt-1">
            Të paktën 6 karaktere, me 1 shkronjë dhe 1 numër.
          </p>
        </div>

        {/* Fusha: Konfirmimi i fjalëkalimit (krahasohet te validate) */}
        <div>
          <label className="block text-sm font-medium mb-1">Konfirmo fjalëkalimin</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Zgjedhja e rolit. Roli "admin" nuk ofrohet këtu:
            administratori krijohet direkt në databazë. */}
        <div>
          <label className="block text-sm font-medium mb-1">Regjistrohu si</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="candidate">Kandidat</option>
            <option value="company">Kompani</option>
          </select>
        </div>

        {/* Butoni: çaktivizohet gjatë pritjes që të mos klikohet dy herë */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {/* Teksti ndryshon sipas gjendjes loading */}
          {loading ? "Duke u regjistruar..." : "Regjistrohu"}
        </button>
      </form>

      {/* Lidhje për përdoruesit që kanë llogari */}
      <p className="text-sm text-center text-gray-600 mt-4">
        Ke tashmë llogari?{" "}
        <Link to="/login" className="text-indigo-600 font-medium">
          Kyçu këtu
        </Link>
      </p>
    </div>
  );
}
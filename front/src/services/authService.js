// ============================================================
// authService.js — Shërbimi i autentifikimit
// Këtu janë të gjitha funksionet që lidhen me llogarinë e përdoruesit:
// regjistrimi, kyçja, çkyçja dhe leximi i përdoruesit të kyçur.
// Faqet (Register.jsx, Login.jsx, Navbar...) nuk flasin drejtpërdrejt
// me serverin për këto punë, por i thërrasin këto funksione.
// ============================================================

// api: Axios-i i konfiguruar te axios.js, me adresën e backend-it (baseURL)
// dhe me token-in që shtohet automatikisht në çdo kërkesë.
import api from "../api/axios";

// ---------- REGJISTRIMI ----------
// Merr të dhënat nga formulari i regjistrimit.
// export → mund të përdoret nga skedarë të tjerë (p.sh. Register.jsx)
// async → brenda funksionit presim (await) përgjigjen e serverit
export async function register({ full_name, email, password, role }) {
  // Dërgon kërkesë POST te: baseURL + /auth/register.php
  // Të dhënat dërgohen në format JSON.
  const res = await api.post("/auth/register.php", { full_name, email, password, role });

  // Serveri kthen { token, user }. I ruajmë në shfletues,
  // prandaj pas regjistrimit përdoruesi është menjëherë i kyçur.
  saveSession(res.data);

  // Ia kthejmë të dhënat faqes që e thirri (Register.jsx),
  // që ajo të dijë rolin dhe ku ta ridrejtojë përdoruesin.
  return res.data;
}

// ---------- KYÇJA ----------
// Merr email-in dhe fjalëkalimin nga formulari i kyçjes.
export async function login({ email, password }) {
  // Dërgon kërkesë POST te: baseURL + /auth/login.php
  // Serveri kontrollon fjalëkalimin. Nëse është gabim, kthen kod gabimi
  // dhe ekzekutimi kalon te catch-i i faqes që e thirri.
  const res = await api.post("/auth/login.php", { email, password });

  // Nëse kyçja pati sukses, ruajmë token-in dhe përdoruesin
  saveSession(res.data);

  return res.data;
}

// ---------- ÇKYÇJA ----------
export async function logout() {
  try {
    // I kërkon serverit ta fshijë token-in nga tabela auth_tokens.
    // Kështu token-i bëhet i pavlefshëm edhe nëse dikush e ka kopjuar.
    await api.post("/auth/logout.php");
  } catch {
    // Edhe nëse kërkesa dështon (p.sh. s'ka internet ose serveri është i fikur),
    // nuk ndalemi: përdoruesi çkyçet gjithsesi në shfletues.
  }

  // Fshin token-in dhe të dhënat e përdoruesit nga shfletuesi
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ---------- PËRDORUESI AKTUAL ----------
// Kthen përdoruesin e kyçur, ose null nëse askush nuk është i kyçur.
// Përdoret p.sh. te Navbar (për të shfaqur lidhjet sipas rolit)
// dhe te PrivateRoute (për të lejuar ose ndaluar hyrjen në një faqe).
export function getCurrentUser() {
  // localStorage ruan vetëm tekst, prandaj user-i është ruajtur si tekst JSON
  const user = localStorage.getItem("user");

  // Nëse ekziston, e kthejmë nga teksti në objekt (JSON.parse).
  // Nëse jo, kthejmë null.
  return user ? JSON.parse(user) : null;
}

// ---------- RUAJTJA E SESIONIT ----------
// Funksion ndihmës, i përdorur vetëm brenda këtij skedari
// (nuk ka export, prandaj faqet e tjera nuk mund ta thërrasin).
function saveSession(data) {
  // Token-i ruhet si tekst. axios.js e lexon nga këtu
  // dhe e shton në header-in Authorization të çdo kërkese.
  localStorage.setItem("token", data.token);

  // User-i është objekt { id, full_name, email, role ... },
  // prandaj e kthejmë në tekst me JSON.stringify para se ta ruajmë.
  localStorage.setItem("user", JSON.stringify(data.user));
}
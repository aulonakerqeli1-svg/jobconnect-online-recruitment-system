// ============================================================
// adminService.js — Funksionet që flasin me endpoint-et e administratorit
// I përdor vetëm AdminDashboard.jsx. Të gjitha kërkesat shkojnë te
// folderi admin/ në backend dhe kërkojnë token me rolin "admin".
// ============================================================

// api = instanca e axios-it (baseURL + token-i shtohet automatikisht)
import api from "../api/axios";

// Merr shpalljet për administratorin, me filtra.
// filters = {} → nëse nuk jepen filtra, merret objekt bosh.
// URLSearchParams e kthen objektin në tekst për adresë:
//   { status: "pending", category_id: 3 } → "status=pending&category_id=3"
// Kërkesa: GET admin/jobs.php?status=pending&category_id=3
export async function getJobsForAdmin(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/admin/jobs.php?${params}`);
  return res.data; // lista e shpalljeve
}

// Miraton ose refuzon një shpallje.
// jobId  → cila shpallje (dërgohet në adresë si ?id=)
// status → "approved" ose "rejected"
// adminNote → arsyeja (opsionale). Parazgjedhja "" = pa arsye.
// Kërkesa: PUT admin/jobs.php?id=5 me trup JSON { status, admin_note }
export async function reviewJob(jobId, status, adminNote = "") {
  const res = await api.put(`/admin/jobs.php?id=${jobId}`, { status, admin_note: adminNote });
  return res.data;
}

// Merr aplikimet/kandidatët me filtra (departamenti, kompania, statusi).
// I njëjti mekanizëm me URLSearchParams si më lart.
// Kërkesa: GET admin/candidates.php?category_id=...&company_id=...&status=...
export async function getCandidatesForAdmin(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/admin/candidates.php?${params}`);
  return res.data;
}

// Merr listën e të gjitha kompanive, për filtrin "Të gjitha kompanitë"
// Kërkesa: GET admin/companies.php
export async function getCompaniesForAdmin() {
  const res = await api.get("/admin/companies.php");
  return res.data;
}

// Merr statistikat: totalet, shpalljet/aplikimet sipas statusit, top 5 departamentet.
// Numërimi bëhet në backend (COUNT, GROUP BY).
// Kërkesa: GET admin/stats.php
export async function getAdminStats() {
  const res = await api.get("/admin/stats.php");
  return res.data;
}
// ============================================================
// MyApplications.jsx — Faqja "Aplikimet e Mia"
// E përdor vetëm kandidati. Shfaq të gjitha aplikimet e tij,
// me pozitën, kompaninë, datën dhe statusin aktual të secilit.
// ============================================================

// useState: "kujtesa" e komponentit
// useEffect: kod që ekzekutohet automatikisht kur hapet faqja
import { useEffect, useState } from "react";
// getMyApplications: merr aplikimet e kandidatit të kyçur nga serveri
import { getMyApplications } from "../services/jobService";

// Ngjyrat e etiketës së statusit (klasa Tailwind CSS).
// Çelësi = statusi siç vjen nga databaza; vlera = ngjyra e sfondit dhe e tekstit.
const statusStyles = {
  pending: "bg-gray-100 text-gray-700",       // gri → në pritje
  reviewed: "bg-indigo-100 text-indigo-700",  // blu → shqyrtuar
  accepted: "bg-green-100 text-green-700",    // e gjelbër → pranuar
  rejected: "bg-red-100 text-red-700",        // e kuqe → refuzuar
};

// Përkthimi i statusit në shqip për t'u shfaqur te përdoruesi.
// Databaza i ruan në anglisht, ndërfaqja i tregon në shqip.
const statusLabels = {
  pending: "Në pritje",
  reviewed: "Shqyrtuar",
  accepted: "Pranuar",
  rejected: "Refuzuar",
};

export default function MyApplications() {
  // ---------- GJENDJA (STATE) ----------
  const [applications, setApplications] = useState([]); // lista e aplikimeve (fillimisht bosh)
  const [loading, setLoading] = useState(true);          // true derisa të vijnë të dhënat

  // ---------- NGARKIMI I APLIKIMEVE ----------
  // Ekzekutohet VETËM NJË HERË kur hapet faqja ([] bosh).
  // GET /applications/index.php → backend-i e njeh kandidatin nga token-i
  // dhe kthen vetëm aplikimet e tij.
  useEffect(() => {
    getMyApplications().then((data) => {
      setApplications(data); // ruan aplikimet
      setLoading(false);     // fsheh tekstin "Duke ngarkuar..."
    });
  }, []);

  // ---------- PAMJA (JSX) ----------
  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 pb-16">
      <h1 className="text-2xl font-semibold mb-6">Aplikimet e Mia</h1>

      {/* Gjatë ngarkimit → tekst; pas ngarkimit → lista */}
      {loading ? (
        <p>Duke ngarkuar...</p>
      ) : (
        <div className="space-y-4">
          {/* Për çdo aplikim krijohet një kartë */}
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow p-4">
              {/* justify-between → teksti majtas, etiketa e statusit djathtas */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{app.job_title}</h2>
                  <p className="text-sm text-gray-500">{app.company_name}</p>
                  {/* Data e aplikimit në format shqip (p.sh. 12.10.2026).
                      new Date(...) e kthen tekstin nga databaza në datë,
                      toLocaleDateString("sq") e shfaq sipas formatit shqip. */}
                  <p className="text-xs text-gray-400 mt-1">
                    Aplikuar më {new Date(app.applied_at).toLocaleDateString("sq")}
                  </p>
                </div>
                {/* Etiketa e statusit: ngjyra nga statusStyles, teksti nga statusLabels.
                    P.sh. status "accepted" → etiketë e gjelbër "Pranuar" */}
                <span className={`text-xs px-2 py-1 rounded ${statusStyles[app.status]}`}>
                  {statusLabels[app.status]}
                </span>
              </div>
            </div>
          ))}

          {/* Nëse kandidati nuk ka aplikuar ende → mesazh në vend të faqes bosh */}
          {applications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-4xl mb-2">📨</div>
              <p className="text-gray-500">Ende s'ke aplikuar për asnjë pozitë.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
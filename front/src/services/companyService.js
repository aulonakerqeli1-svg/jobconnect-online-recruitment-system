import api from "../api/axios";

export async function getMyCompanyProfile() {
  const res = await api.get("/companies/profile.php");
  return res.data;
}

export async function updateMyCompanyProfile(profileData) {
  const res = await api.put("/companies/profile.php", profileData);
  return res.data;
}

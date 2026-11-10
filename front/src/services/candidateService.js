import api from "../api/axios";

export async function getMyProfile() {
  const res = await api.get("/candidates/profile.php");
  return res.data;
}

export async function updateMyProfile(profileData) {
  const res = await api.put("/candidates/profile.php", profileData);
  return res.data;
}

export async function uploadMyPhoto(photoFile) {
  const formData = new FormData();
  formData.append("photo", photoFile);
  const res = await api.post("/candidates/upload_photo.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

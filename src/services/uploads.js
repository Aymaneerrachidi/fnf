import { ensureSession, supabase } from "../lib/supabase.js";

export async function uploadImage(file, folder = "profiles") {
  const session = await ensureSession();
  if (!file?.type?.startsWith("image/")) throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Keep images under 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${session.user.id}/${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("fnf-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("fnf-media").getPublicUrl(path).data.publicUrl;
}

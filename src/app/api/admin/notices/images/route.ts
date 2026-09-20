import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;

// Trust the bytes, not the file name: an ".png" that is really HTML would be
// served from our own origin.
const SIGNATURES: { ext: string; contentType: string; magic: number[] }[] = [
  { ext: "png", contentType: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { ext: "jpg", contentType: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  { ext: "gif", contentType: "image/gif", magic: [0x47, 0x49, 0x46, 0x38] },
  { ext: "webp", contentType: "image/webp", magic: [0x52, 0x49, 0x46, 0x46] },
];

function detectImage(bytes: Uint8Array) {
  return SIGNATURES.find((signature) =>
    signature.magic.every((byte, index) => bytes[index] === byte)
  );
}

export async function POST(request: Request) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "이미지는 5MB까지 올릴 수 있습니다." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = detectImage(bytes);

  if (!image) {
    return NextResponse.json({ error: "이미지 파일만 올릴 수 있습니다." }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const path = `${crypto.randomUUID()}.${image.ext}`;
  const { error } = await supabase.storage
    .from("notice-images")
    .upload(path, bytes, { contentType: image.contentType });

  if (error) {
    console.error("notice image upload failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("notice-images").getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}

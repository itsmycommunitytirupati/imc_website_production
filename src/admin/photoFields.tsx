// Photo inputs shared by the admin forms: upload (shrunk to WebP in the browser), preview, paste a link.
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { ApiError, imageUrl, uploadImage } from "../lib/api";

export function UploadButton({ multiple = false, onFiles, busy, label = "Upload photo" }: { multiple?: boolean; onFiles: (files: File[]) => void; busy: boolean; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple={multiple} hidden onChange={(e) => {
        const files = [...(e.target.files ?? [])];
        e.target.value = "";
        if (files.length) onFiles(files);
      }} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-brand/50 disabled:opacity-60">
        <Upload className="h-4 w-4" /> {busy ? "Uploading…" : label}
      </button>
    </>
  );
}

export const uploadError = (e: unknown) =>
  e instanceof ApiError && e.code === "too_large" ? "That photo is too big even after shrinking." : e instanceof ApiError && e.status === 401 ? "Your sign-in expired. Reload the page." : "Upload failed. Try a JPEG or PNG.";

export function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const upload = async ([file]: File[]) => {
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setErr(uploadError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-1 flex items-start gap-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-line">
        {value && <img src={imageUrl(value)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <UploadButton onFiles={upload} busy={busy} label={value ? "Replace photo" : "Upload photo"} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste a link" className="w-full rounded-lg border border-line px-3 py-1.5 text-xs text-muted" />
        {err && <p className="text-xs text-red-700">{err}</p>}
      </div>
    </div>
  );
}

export function ImagesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const list = value.split("\n").map((s) => s.trim()).filter(Boolean);
  const upload = async (files: File[]) => {
    setBusy(true);
    setErr("");
    const added: string[] = [];
    for (const f of files) {
      try {
        added.push(await uploadImage(f));
      } catch (e) {
        setErr(uploadError(e));
      }
    }
    onChange([...list, ...added].join("\n"));
    setBusy(false);
  };
  return (
    <div className="mt-1 space-y-2">
      <div className="flex flex-wrap gap-2">
        {list.map((img, i) => (
          <div key={`${img}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg ring-1 ring-line">
            <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1 text-[10px] font-bold text-white">Cover</span>}
            <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i).join("\n"))} aria-label="Remove photo" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-ink"><X className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
      <UploadButton multiple onFiles={upload} busy={busy} label="Add photos" />
      {err && <p className="text-xs text-red-700">{err}</p>}
    </div>
  );
}

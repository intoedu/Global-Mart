"use client";

import { useEffect, useState } from "react";
import { decryptBytes } from "@/lib/crypto";
import { asset } from "@/lib/paths";
import { IMAGE_TOKEN, formatBytes, listedFiles } from "@/lib/board";
import type { Attachment } from "@/lib/types";
import { Linkify } from "./PostView";

type Keys = Record<string, string> | undefined;

/** 화면에 그대로 보여 줄 수 있는 이미지 형식 */
const IMAGE_TYPES = /^image\/(png|jpeg|gif|webp|avif|bmp)$/;
export const isShowableImage = (type: string) => IMAGE_TYPES.test(type);

/** 암호화된 첨부 파일을 내려받아 풉니다. */
async function loadFile(f: Attachment, keys: Keys): Promise<ArrayBuffer> {
  const key = keys?.[f.kid];
  if (!key) throw new Error("key");
  const res = await fetch(asset(`/${f.path}`));
  if (!res.ok) throw new Error(String(res.status));
  const plain = await decryptBytes(await res.arrayBuffer(), key);
  if (!plain) throw new Error("decrypt");
  return plain;
}

/** 본문: 줄바꿈·자동 링크 + [[image:id]] 자리에 암호를 푼 이미지 */
export function SecureBody({ body, files, keys, ko }: { body: string; files?: Attachment[]; keys: Keys; ko: boolean }) {
  const parts = body.split(new RegExp(IMAGE_TOKEN.source));
  if (parts.length === 1) return <Linkify text={body} />;
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          // 이미지 앞뒤의 줄바꿈 한 개는 이미지 여백으로 대신합니다.
          let text = part;
          if (i > 0) text = text.replace(/^\r?\n/, "");
          if (i < parts.length - 1) text = text.replace(/\r?\n$/, "");
          return text ? <Linkify key={i} text={text} /> : null;
        }
        const f = files?.find((x) => x.id === part);
        return f && isShowableImage(f.type) ? <SecureImage key={i} file={f} keys={keys} ko={ko} /> : null;
      })}
    </>
  );
}

function SecureImage({ file, keys, ko }: { file: Attachment; keys: Keys; ko: boolean }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    let made = "";
    loadFile(file, keys)
      .then((buf) => {
        if (!alive) return;
        made = URL.createObjectURL(new Blob([buf], { type: file.type }));
        setUrl(made);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [file, keys]);
  return (
    <span className="my-6 block">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="mx-auto block h-auto max-h-[80vh] max-w-full rounded-xl border border-line" />
      ) : (
        <span role={failed ? "alert" : "status"} className="grid min-h-40 place-items-center rounded-xl bg-paper px-4 text-center text-small text-muted">
          {failed
            ? ko
              ? "이미지를 불러오지 못했습니다. (방금 올린 이미지는 1~2분 뒤에 보입니다)"
              : "Could not load the image. (Newly added images appear after 1–2 minutes.)"
            : ko
              ? "이미지 불러오는 중…"
              : "Loading image…"}
        </span>
      )}
    </span>
  );
}

/** 첨부 파일 목록 (본문에 넣은 이미지는 제외) — 누르면 암호를 풀어 내려받습니다. */
export function AttachmentList({ files, body, keys, ko }: { files?: Attachment[]; body: string; keys: Keys; ko: boolean }) {
  const list = listedFiles(files, body);
  const [state, setState] = useState<Record<string, "busy" | "error">>({});
  if (!list.length) return null;

  const download = async (f: Attachment) => {
    setState((s) => ({ ...s, [f.id]: "busy" }));
    try {
      const buf = await loadFile(f, keys);
      // 브라우저가 열지 않고 저장하도록 일반 파일 형식으로 만듭니다.
      const url = URL.createObjectURL(new Blob([buf], { type: "application/octet-stream" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setState((s) => {
        const n = { ...s };
        delete n[f.id];
        return n;
      });
    } catch {
      setState((s) => ({ ...s, [f.id]: "error" }));
    }
  };

  return (
    <section aria-label={ko ? "첨부 파일" : "Attachments"} className="mb-8 rounded-2xl bg-paper p-5 sm:p-6">
      <p className="flex items-center gap-2 text-small font-bold text-ink">
        <ClipIcon /> {ko ? "첨부 파일" : "Attachments"} <span className="font-normal text-muted">{list.length}</span>
      </p>
      <ul className="mt-3 space-y-2">
        {list.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => download(f)}
              disabled={state[f.id] === "busy"}
              className="group flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-card transition hover:ring-1 hover:ring-ink/20 disabled:opacity-70"
            >
              <span className="min-w-0 flex-1">
                <span lang="ko" className="block truncate font-semibold text-ink decoration-accent underline-offset-4 group-hover:underline">
                  {f.name}
                </span>
                <span className="block text-caption text-muted">
                  {formatBytes(f.size)}
                  {state[f.id] === "error" &&
                    (ko ? " · 내려받지 못했습니다. 잠시 후 다시 시도해 주세요." : " · Download failed. Please try again later.")}
                </span>
              </span>
              <span className="shrink-0 text-small font-semibold text-ink-3">
                {state[f.id] === "busy" ? (ko ? "준비 중…" : "Preparing…") : ko ? "내려받기" : "Download"}
              </span>
              <DownloadIcon />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClipIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 01-7.8-7.8l8.6-8.6a3.7 3.7 0 015.2 5.2l-8.6 8.6a1.8 1.8 0 01-2.6-2.6l7.9-7.9" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-accent" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { decryptJson } from "@/lib/crypto";
import { BOARD_FILES, PW_KEY } from "@/lib/board";
import { asset } from "@/lib/paths";
import type { EncryptedFile } from "@/lib/types";

export type VaultState = "init" | "locked" | "checking" | "error";

/**
 * 회원 전용 게시판 데이터 열기 — 암호화 파일을 내려받아 브라우저에서 비밀번호로 풉니다.
 * 비밀번호는 이 탭(sessionStorage)에만 기억되고, 창을 닫으면 사라집니다.
 */
export function useVault<T>(kind: "biz" | "resident", ko: boolean, normalize: (d: T) => T = (d) => d) {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<VaultState>("init");
  const [error, setError] = useState("");
  const key = PW_KEY[kind];

  const unlock = useCallback(
    async (pw: string, silent = false) => {
      setState("checking");
      setError("");
      try {
        const res = await fetch(asset(BOARD_FILES[kind].web), { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const file = (await res.json()) as EncryptedFile;
        const plain = await decryptJson<T>(file, pw);
        if (!plain) {
          try { sessionStorage.removeItem(key); } catch {}
          setState("locked");
          if (!silent) setError(ko ? "비밀번호가 올바르지 않습니다." : "Incorrect password.");
          return;
        }
        try { sessionStorage.setItem(key, pw); } catch {}
        setData(normalize(plain));
      } catch {
        setState("error");
      }
    },
    // normalize 는 모듈 함수만 넘기므로 의존성에서 뺍니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, key, ko]
  );

  useEffect(() => {
    let saved: string | null = null;
    try { saved = sessionStorage.getItem(key); } catch {}
    if (saved) unlock(saved, true);
    else setState("locked");
  }, [unlock, key]);

  const lock = useCallback(() => {
    try { sessionStorage.removeItem(key); } catch {}
    setData(null);
    setState("locked");
  }, [key]);

  return { data, state, error, unlock, lock };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { decryptJson } from "@/lib/crypto";
import { BOARD_FILE, LEGACY_PW_KEY, PW_KEY, normalizeBoard } from "@/lib/board";
import { asset } from "@/lib/paths";
import type { BoardData, EncryptedFile } from "@/lib/types";

export type VaultState = "init" | "locked" | "checking" | "error";

const store = {
  get(k: string) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      sessionStorage.setItem(k, v);
    } catch {}
  },
  remove(k: string) {
    try {
      sessionStorage.removeItem(k);
    } catch {}
  },
};

/**
 * 해외Biz정보(해외주재원 전용) 데이터 열기 — 암호화 파일을 내려받아 브라우저에서 회원 비밀번호로 풉니다.
 * 비밀번호는 이 탭(sessionStorage)에만 기억되고, 창을 닫으면 사라집니다. 한 번 열면 모든 카테고리를 이용합니다.
 */
export function useVault(ko: boolean) {
  const [data, setData] = useState<BoardData | null>(null);
  const [state, setState] = useState<VaultState>("init");
  const [error, setError] = useState("");

  const unlock = useCallback(
    async (pw: string, silent = false) => {
      setState("checking");
      setError("");
      try {
        const res = await fetch(asset(BOARD_FILE.web), { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const file = (await res.json()) as EncryptedFile;
        const plain = await decryptJson<BoardData>(file, pw);
        if (!plain) {
          store.remove(PW_KEY);
          setState("locked");
          if (!silent) setError(ko ? "비밀번호가 올바르지 않습니다." : "Incorrect password.");
          return false;
        }
        store.set(PW_KEY, pw);
        setData(normalizeBoard(plain));
        return true;
      } catch {
        setState("error");
        return false;
      }
    },
    [ko]
  );

  useEffect(() => {
    const saved = store.get(PW_KEY);
    // 예전 '해외주재원 전용' 탭의 비밀번호는 지움 (2026-11 회원 비밀번호를 바꿔 더 이상 열리지 않음)
    store.remove(LEGACY_PW_KEY);
    if (saved) void unlock(saved, true);
    else setState("locked");
  }, [unlock]);

  const lock = useCallback(() => {
    store.remove(PW_KEY);
    store.remove(LEGACY_PW_KEY);
    setData(null);
    setState("locked");
  }, []);

  return { data, state, error, unlock, lock };
}

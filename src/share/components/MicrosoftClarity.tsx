"use client";

import { useEffect } from "react";
import { initializeClarity } from "@/share/lib/clarity";

export default function ClarityProvider() {
  useEffect(() => {
    initializeClarity();
  }, []);

  return null;
}
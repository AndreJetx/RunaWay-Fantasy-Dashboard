"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Notes from "@/features/notes";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { useTranslation } from "@/lib/i18n/context";

export default function NotesPage() {
  const router = useRouter();
  const [isDM, setIsDM] = useState<boolean | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setIsDM(data.role === "dm");
          if (data.role !== "dm") {
            router.push("/dashboard");
          }
        } else {
          setIsDM(false);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setIsDM(false);
        router.push("/dashboard");
      }
    };
    checkRole();
  }, [router]);

  if (isDM === null) {
    return (
      <FantasyLayout>
        <div className="text-center py-12 text-muted-foreground">
          {t("maps.checkingPermissions")}
        </div>
      </FantasyLayout>
    );
  }

  if (!isDM) {
    return null;
  }

  return <Notes />;
}


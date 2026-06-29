"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { href: "/period", label: "Period" },
  { href: "/archive/today", label: "Archive" }
];

export function Shell({
  title,
  subtitle,
  meta,
  children
}: {
  title: string;
  subtitle: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="page">
      <div className="pageGlow pageGlowLeft" />
      <div className="pageGlow pageGlowRight" />
      <main className="frame">
        <header className="hero card">
          <div>
            <p className="eyebrow">BeatsPerfect Net</p>
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>
          </div>
          <div className="heroActions">
            <div className="tabbar" role="tablist" aria-label="Dashboard sections">
              {tabs.map((tab) => {
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={active ? "tab active" : "tab"}
                    aria-current={active ? "page" : undefined}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
            {meta ? <div className="snapshotMeta">{meta}</div> : null}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

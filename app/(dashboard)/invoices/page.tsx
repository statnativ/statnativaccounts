"use client";

import { Suspense } from "react";
import InvoicesPageContent from "./page-content";

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12">Loading...</div>}>
      <InvoicesPageContent />
    </Suspense>
  );
}

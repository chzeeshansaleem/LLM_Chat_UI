import { COMPANY_INFO } from "@/lib/constant";

// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t p-4 text-center text-xs text-gray-500 bg-[var(--footer-background)]">
      <p className="mb-2">
        Copyright 2025 - {COMPANY_INFO.companyName} - {COMPANY_INFO.brands.join(' - ')} -
        {COMPANY_INFO.address}
      </p>
      <div className="flex justify-center gap-4">
        <a href={COMPANY_INFO.companyPolicyLink} className="hover:underline">
          Unternehmensregeln
        </a>
        <span>·</span>
        <a href={COMPANY_INFO.companyTermsLink} className="hover:underline">
          Nutzungsbedingungen
        </a>
      </div>
    </footer>
  );
}

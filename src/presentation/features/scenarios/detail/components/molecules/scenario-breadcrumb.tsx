"use client";

import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

interface ScenarioBreadcrumbProps {
  backText?: string;
  backUrl?: string;
}

/**
 * Scenario Breadcrumb Molecule
 * Provides navigation back to scenarios list
 */
export function ScenarioBreadcrumb({ 
  backText = "Volver a todos los escenarios",
  backUrl = "/"
}: ScenarioBreadcrumbProps) {
  return (
    <Link
      href={backUrl}
      className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm mb-2"
    >
      <FiChevronLeft className="h-4 w-4 mr-1" />
      {backText}
    </Link>
  );
}

ScenarioBreadcrumb.displayName = "ScenarioBreadcrumb";
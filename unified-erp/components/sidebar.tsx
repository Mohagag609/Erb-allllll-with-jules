"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, Users, FileText, Briefcase, BarChart2, Settings, Landmark, Truck, Construction, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  type: 'link';
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  type: 'section';
  title: string;
  links: Omit<NavLink, 'type'>[];
}

type NavItem = NavLink | NavSection;


const navLinks: NavItem[] = [
  { type: 'link', href: "/dashboard", label: "لوحة التحكم", icon: Home },
  {
    type: 'section',
    title: "العقارات",
    links: [
      { href: "/real-estate/projects", label: "المشاريع العقارية", icon: Building },
      { href: "/real-estate/units", label: "الوحدات", icon: Briefcase },
      { href: "/real-estate/clients", label: "العملاء", icon: Users },
      { href: "/real-estate/contracts", label: "العقود", icon: FileText },
      { href: "/real-estate/installments", label: "الأقساط", icon: FileText },
      { href: "/real-estate/partners", label: "الشركاء", icon: Users },
      { href: "/real-estate/returns", label: "المرتجعات", icon: FileText },
    ],
  },
  {
    type: 'section',
    title: "المحاسبة",
    links: [
        { href: "/accounting/journal", label: "قيود اليومية", icon: FileText },
        { href: "/accounting/cashboxes", label: "الخزن والبنوك", icon: Landmark },
        { href: "/accounting/vouchers", label: "سندات القبض والصرف", icon: FileText },
        { href: "/accounting/invoices", label: "الفواتير", icon: FileText },
        { href: "/accounting/transfers", label: "تحويلات الخزن", icon: Landmark },
        { href: "/accounting/bank-imports", label: "كشوفات البنك", icon: Landmark },
    ]
  },
  {
    type: 'section',
    title: "المشاريع والمقاولات",
    links: [
        { href: "/projects/projects", label: "المشاريع", icon: Construction },
        { href: "/projects/phases", label: "المراحل", icon: Construction },
        { href: "/projects/materials", label: "المواد", icon: Truck },
        { href: "/projects/material-moves", label: "حركة المواد", icon: Truck },
    ]
  },
  { type: 'link', href: "/reports", label: "التقارير", icon: BarChart2 },
  { type: 'link', href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen p-4 bg-gray-100 dark:bg-gray-800 border-l dark:border-gray-700">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-primary">ERP الموحد</h2>
      </div>
      <nav className="space-y-4">
        {navLinks.map((item, index) => (
          <div key={`nav-item-${index}`}>
            {item.type === 'section' ? (
              <>
                <h3 className="px-4 mt-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  {item.title}
                </h3>
                <div className="space-y-1">
                  {item.links.map((link, linkIndex) => (
                    <Link
                      key={`${item.title}-${linkIndex}`}
                      href={link.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                        pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      <link.icon className="w-5 h-5 ml-3" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
                <Link
                    key={`link-${index}`}
                    href={item.href}
                    className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                >
                    <item.icon className="w-5 h-5 ml-3" />
                    {item.label}
                </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

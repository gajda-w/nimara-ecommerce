"use client";

import { Search } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Sheet, SheetContent } from "@nimara/ui/components/sheet";

import { SearchForm } from "@/components/header/search-form";

export const MobileSearch = () => {
  const t = useTranslations("search");

  const pathname = usePathname();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, params]);

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="gap-1 md:hidden"
        aria-label={t("open-search")}
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Sheet
        open={isOpen}
        onOpenChange={setIsOpen}
        aria-label={t("search-label")}
        modal={true}
      >
        <SheetContent side="top">
          <SearchForm />
        </SheetContent>
      </Sheet>
    </>
  );
};

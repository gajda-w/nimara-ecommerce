"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { AlertCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { Line as LineType } from "@nimara/domain/objects/common";
import { Button } from "@nimara/ui/components/button";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import { cn } from "@nimara/ui/lib/utils";

import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { paths } from "@/lib/paths";

type LineQuantityChange = (lineId: string, quantity: number) => Promise<void>;

export type LineProps = {
  isDisabled?: boolean;
  isLineEditable?: boolean;
  isOutOfStock?: boolean;
  line: LineType;
  onLineDelete?(lineId: string): Promise<void>;
  onLineQuantityChange?: LineQuantityChange;
};

export const Line = ({
  line: {
    thumbnail,
    product,
    variant,
    id,
    quantity,
    undiscountedTotalPrice,
    total,
  },
  isDisabled,
  onLineQuantityChange,
  onLineDelete,
  isLineEditable = true,
  isOutOfStock = false,
}: LineProps) => {
  const [value, setValue] = useState(quantity.toString());
  const [showMaxQuantityWarning, setShowMaxQuantityWarning] = useState(false);

  const t = useTranslations();
  const formatter = useLocalizedFormatter();
  const inputValue = useDebounce(value, 1000);

  const name = `${product.name} • ${variant.name}`;
  const href = paths.products.asPath({ slug: product.slug, hash: variant.id });

  useEffect(() => {
    if (value === quantity.toString()) {
      return;
    }
    let qty = Number(inputValue);

    if (inputValue === "" || isNaN(qty) || qty < 1) {
      setValue("1");
      qty = 1;

      return;
    }

    if (qty > variant.maxQuantity) {
      setValue(variant.maxQuantity.toString());
      qty = variant.maxQuantity;
      setShowMaxQuantityWarning(true);
    } else {
      setValue(qty.toString());
      if (qty < variant.maxQuantity) {
        setShowMaxQuantityWarning(false);
      }
    }

    void onLineQuantityChange?.(id, qty);
  }, [inputValue]);

  const handleLineDelete = async () => {
    await onLineDelete?.(id);
  };

  return (
    <div className="grid grid-cols-12 grid-rows-2 items-start gap-2 md:grid-rows-1 md:items-center [&>*]:transition-colors">
      <div className="col-span-2 row-span-2 h-full p-[5px] md:row-span-1">
        <Link title={name} href={href}>
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={thumbnail.alt ?? name}
              sizes="56px"
              width={0}
              height={0}
              className={cn(
                "h-[56px] w-[42px] object-cover",
                isOutOfStock && "grayscale",
              )}
            />
          ) : (
            <ProductImagePlaceholder
              height={56}
              width={42}
              className={cn(isOutOfStock && "grayscale")}
            />
          )}
        </Link>
      </div>

      <div
        className={cn("col-span-9 md:col-span-5", {
          "md:col-span-6": !isLineEditable,
        })}
      >
        <Link title={name} href={href} className="grow">
          <p className={cn(isOutOfStock ? "text-stone-400" : "text-stone-900")}>
            {name}
          </p>
        </Link>
      </div>

      <div className="col-span-5 row-span-2 flex items-center gap-2 md:col-span-2 md:row-span-1">
        {isLineEditable ? (
          <>
            <Label
              className={cn(isOutOfStock ? "text-stone-400" : "text-stone-900")}
              htmlFor={`${id}:qty`}
            >
              {t("common.qty")}
            </Label>
            <Input
              name={`${id}:qty`}
              className={cn(
                isOutOfStock ? "text-stone-400" : "text-stone-900",
                "w-14",
              )}
              type="number appearance-none"
              disabled={isDisabled}
              value={value}
              onChange={(evt) => setValue(evt.target.value)}
              inputMode="numeric"
              data-testid="cart-product-line-qty"
              id={`${id}:qty`}
            />
          </>
        ) : (
          <p className="text-sm text-stone-400">
            {t("common.qty")}: {value}
          </p>
        )}
      </div>

      <div className="col-span-5 row-span-1 md:col-span-2">
        <p
          className={cn("flex justify-end", {
            "text-sm text-stone-400": !isLineEditable,
            "text-stone-400": isOutOfStock,
          })}
          data-testid="shopping-bag-product-line-price"
        >
          {undiscountedTotalPrice.amount === 0 || total.amount === 0
            ? t("common.free")
            : formatter.price({
                amount: undiscountedTotalPrice.amount ?? total.amount,
              })}
        </p>
      </div>

      {isLineEditable && (
        <div className="col-start-12 col-end-12 row-start-1 row-end-1 flex items-center justify-center md:row-span-1">
          <Button
            variant="ghost"
            className="px-3 py-4"
            disabled={isDisabled}
            onClick={handleLineDelete}
            aria-label={t("cart.remove-button")}
          >
            <X height={16} width={16} />
          </Button>
        </div>
      )}
      {showMaxQuantityWarning && (
        <div className="col-span-12 mt-2 flex items-center gap-2 text-red-500">
          <AlertCircle size={16} />
          <span>
            {t("cart.max-quantity", { maxQuantity: variant.maxQuantity })}
          </span>
        </div>
      )}
    </div>
  );
};

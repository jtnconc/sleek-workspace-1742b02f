import {
  QUOTE_LABELS,
  formatDate,
  itemNights,
  lineSubtotal,
  quoteNumber,
  quoteTotals,
} from "@/lib/quote-model";
import { money } from "@/lib/rates";
import type { HotelTemplate, QuoteDoc } from "@/workspace/types";

interface QuotePreviewProps {
  quote: QuoteDoc;
  hotel: HotelTemplate;
  logo?: string;
}

/**
 * HTML mirror of the generated quotation PDF. Same data, same order, fully
 * styleable — the real PDF is still produced by buildQuotePdf at download time.
 */
export function QuotePreview({ quote, hotel, logo }: QuotePreviewProps) {
  const L = QUOTE_LABELS[quote.language];
  const { subtotal, tax, total } = quoteTotals(quote);
  const accent = hotel.accent;
  const secondary = hotel.secondary ?? hotel.accent;
  const image = logo ?? hotel.logoUrl;
  const addressLines = (quote.hotelInfo ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-[816px] bg-white px-8 py-9 text-[13px] leading-relaxed text-neutral-800 shadow-sm sm:px-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {image ? (
            <img src={image} alt={hotel.name} className="h-12 w-auto max-w-[190px] object-contain" />
          ) : (
            <p className="text-base font-semibold" style={{ color: accent }}>
              {hotel.name}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[12px] font-semibold tracking-wide" style={{ color: accent }}>
            {L.quotationNo} {quoteNumber(quote)}
          </p>
          <p className="text-[12px] text-neutral-500">
            {formatDate(quote.issueDate, quote.language)}
          </p>
        </div>
      </div>

      {addressLines.length > 0 && (
        <p className="mt-3 text-[11px] text-neutral-500">{addressLines.join("  ·  ")}</p>
      )}

      <div className="mt-4 h-px w-full" style={{ backgroundColor: accent }} />

      <h2 className="mt-6 text-[15px] font-semibold uppercase tracking-wide" style={{ color: secondary }}>
        {L.title}
      </h2>

      {/* Recipient */}
      <div className="mt-4 space-y-1">
        {(quote.salutation || quote.recipient) && (
          <p className="font-medium text-neutral-900">
            {[quote.salutation, quote.recipient].filter(Boolean).join(" ")}
          </p>
        )}
        {quote.company && (
          <p className="text-neutral-600">
            <span className="text-neutral-400">{L.company}: </span>
            {quote.company}
          </p>
        )}
        {quote.guest && (
          <p className="text-neutral-600">
            <span className="text-neutral-400">{L.guest}: </span>
            {quote.guest}
          </p>
        )}
      </div>

      {quote.intro && <p className="mt-4 text-neutral-700">{quote.intro}</p>}

      {/* Items */}
      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ backgroundColor: `${accent}14`, color: secondary }}>
            <th className="px-2 py-2 text-left font-semibold">{L.roomTypeShort}</th>
            <th className="px-2 py-2 text-left font-semibold">{L.name}</th>
            <th className="px-2 py-2 text-left font-semibold">{L.accommodation}</th>
            <th className="px-2 py-2 text-right font-semibold">{L.nights}</th>
            <th className="px-2 py-2 text-right font-semibold">{L.rate}</th>
            <th className="px-2 py-2 text-right font-semibold">{L.subtotal}</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item) => {
            const nights = itemNights(item, quote);
            return (
              <tr key={item.id} className="border-b border-neutral-200 align-top">
                <td className="px-2 py-2">{item.roomType || "—"}</td>
                <td className="px-2 py-2 text-neutral-600">{item.guestName || "—"}</td>
                <td className="px-2 py-2 text-neutral-600">
                  {item.kind === "other" ? "—" : item.accommodation}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{nights}</td>
                <td className="px-2 py-2 text-right tabular-nums">{money(item.ratePerNight)}</td>
                <td className="px-2 py-2 text-right font-medium tabular-nums">
                  {money(lineSubtotal(item, nights))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-[260px] space-y-1 text-[12px]">
          <div className="flex justify-between text-neutral-600">
            <span>{L.subtotal}</span>
            <span className="tabular-nums">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>{hotel.taxLabel}</span>
            <span className="tabular-nums">{money(tax)}</span>
          </div>
          <div
            className="mt-1 flex justify-between border-t pt-2 text-[13px] font-semibold text-neutral-900"
            style={{ borderColor: accent }}
          >
            <span>{L.total}</span>
            <span className="tabular-nums">{money(total)}</span>
          </div>
        </div>
      </div>

      {quote.includedServices.length > 0 && (
        <div className="mt-6">
          <p className="text-[12px] font-semibold" style={{ color: secondary }}>
            {L.services}
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] text-neutral-600">
            {quote.includedServices.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      )}

      {quote.signature && (
        <p className="mt-6 whitespace-pre-line text-[12px] text-neutral-600">{quote.signature}</p>
      )}
    </div>
  );
}

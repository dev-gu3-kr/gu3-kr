import { OFFICE_FACILITY_CARDS } from "./officeGuide.data"

function renderCardLine(line: string, key: string) {
  if (line.startsWith("*")) {
    return (
      <p key={key} className="whitespace-pre-line text-[#bd2125]">
        {line}
      </p>
    )
  }

  const [heading, ...details] = line.split("\n")
  const detailOccurrences = new Map<string, number>()

  return (
    <div key={key} className="space-y-0.5">
      <p className="font-semibold text-[#252629]">{heading}</p>
      {details.map((detail) => {
        const occurrence = detailOccurrences.get(detail) ?? 0
        detailOccurrences.set(detail, occurrence + 1)

        return (
          <p
            key={`${key}-${detail}-${occurrence}`}
            className="font-normal text-[#252629]"
          >
            {detail}
          </p>
        )
      })}
    </div>
  )
}

export function OfficeFacilityCards() {
  return (
    <div className="space-y-4">
      <p className="text-base font-bold text-[#b1232a]">• 부속시설 안내</p>

      <div className="grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
        {OFFICE_FACILITY_CARDS.map((card) => (
          <article
            key={card.title}
            className="h-full bg-[#f6f6f6] px-5 py-5 md:min-h-[248px]"
          >
            <p className="text-base font-bold leading-6 text-[#252629]">
              {card.title}
            </p>

            <div className="mt-3 space-y-2 text-sm font-medium leading-[22px] text-[#252629]">
              {card.lines.map((line, index) =>
                line === "" ? (
                  <div key={`${card.title}-${index}`} className="h-1" />
                ) : (
                  renderCardLine(line, `${card.title}-${index}`)
                ),
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/typography")({
  component: TypographyTestPage,
})

interface TypeToken {
  className: string
  name: string
  weight: string
  metric: string
  tracking: string
  isNew?: boolean
}

interface TypeGroup {
  title: string
  items: TypeToken[]
}

const SAMPLE = "세상의 틀을 깰 챌린저들이 하나로 모이는 곳"

const GROUPS: TypeGroup[] = [
  {
    title: "Display",
    items: [
      {
        className: "text-display-1-bold",
        name: "Display 1",
        weight: "Bold (700)",
        metric: "48px / 120%",
        tracking: "-3%",
      },
      {
        className: "text-display-2-medium",
        name: "Display 2",
        weight: "Medium (500)",
        metric: "40px / 120%",
        tracking: "-2%",
      },
    ],
  },
  {
    title: "Heading",
    items: [
      {
        className: "text-heading-1-bold",
        name: "Heading 1",
        weight: "Bold (700)",
        metric: "36px / 125%",
        tracking: "-2%",
      },
      {
        className: "text-heading-2-bold",
        name: "Heading 2",
        weight: "Bold (700)",
        metric: "32px / 125%",
        tracking: "-2%",
      },
      {
        className: "text-heading-3-semibold",
        name: "Heading 3",
        weight: "SemiBold (600)",
        metric: "28px / 130%",
        tracking: "-2%",
      },
      {
        className: "text-heading-4-semibold",
        name: "Heading 4",
        weight: "SemiBold (600)",
        metric: "26px / 135%",
        tracking: "-2%",
      },
      {
        className: "text-heading-5-bold",
        name: "Heading 5",
        weight: "Bold (700)",
        metric: "24px / 135%",
        tracking: "-2%",
      },
      {
        className: "text-heading-5-semibold",
        name: "Heading 5",
        weight: "SemiBold (600)",
        metric: "24px / 135%",
        tracking: "-2%",
      },
      {
        className: "text-heading-6-semibold",
        name: "Heading 6",
        weight: "SemiBold (600)",
        metric: "20px / 140%",
        tracking: "-1%",
      },
      {
        className: "text-heading-7-semibold",
        name: "Heading 7",
        weight: "SemiBold (600)",
        metric: "18px / 140%",
        tracking: "-1%",
      },
      {
        className: "text-heading-7-medium",
        name: "Heading 7",
        weight: "Medium (500)",
        metric: "18px / 140%",
        tracking: "-1%",
        isNew: true,
      },
    ],
  },
  {
    title: "Subtitle",
    items: [
      {
        className: "text-subtitle-1-semibold",
        name: "Subtitle 1",
        weight: "SemiBold (600)",
        metric: "20px / 150%",
        tracking: "-1%",
      },
      {
        className: "text-subtitle-1-medium",
        name: "Subtitle 1",
        weight: "Medium (500)",
        metric: "20px / 150%",
        tracking: "-1%",
      },
      {
        className: "text-subtitle-2-medium",
        name: "Subtitle 2",
        weight: "Medium (500)",
        metric: "18px / 150%",
        tracking: "-1%",
      },
      {
        className: "text-subtitle-3-semibold",
        name: "Subtitle 3",
        weight: "SemiBold (600)",
        metric: "16px / 150%",
        tracking: "-1%",
      },
      {
        className: "text-subtitle-4-semibold",
        name: "Subtitle 4",
        weight: "SemiBold (600)",
        metric: "14px / 150%",
        tracking: "-1%",
      },
    ],
  },
  {
    title: "Body",
    items: [
      {
        className: "text-body-1-semibold",
        name: "Body 1",
        weight: "SemiBold (600)",
        metric: "16px / 145%",
        tracking: "-1%",
        isNew: true,
      },
      {
        className: "text-body-1-medium",
        name: "Body 1",
        weight: "Medium (500)",
        metric: "16px / 145%",
        tracking: "-1%",
      },
      {
        className: "text-body-1-regular",
        name: "Body 1",
        weight: "Regular (400)",
        metric: "16px / 145%",
        tracking: "-1%",
      },
      {
        className: "text-body-2-medium",
        name: "Body 2",
        weight: "Medium (500)",
        metric: "14px / 150%",
        tracking: "-1%",
      },
      {
        className: "text-body-2-regular",
        name: "Body 2",
        weight: "Regular (400)",
        metric: "14px / 160%",
        tracking: "-1%",
      },
      {
        className: "text-body-3-medium",
        name: "Body 3",
        weight: "Medium (500)",
        metric: "12px / 150%",
        tracking: "0%",
      },
      {
        className: "text-body-3-regular",
        name: "Body 3",
        weight: "Regular (400)",
        metric: "12px / 150%",
        tracking: "0%",
      },
    ],
  },
  {
    title: "Label",
    items: [
      {
        className: "text-label-1-semibold",
        name: "Label 1",
        weight: "SemiBold (600)",
        metric: "16px / 140%",
        tracking: "-2%",
      },
      {
        className: "text-label-1-medium",
        name: "Label 1",
        weight: "Medium (500)",
        metric: "16px / 140%",
        tracking: "-2%",
      },
      {
        className: "text-label-2-medium",
        name: "Label 2",
        weight: "Medium (500)",
        metric: "14px / 145%",
        tracking: "0%",
      },
      {
        className: "text-label-3-bold",
        name: "Label 3",
        weight: "Bold (700)",
        metric: "12px / 140%",
        tracking: "0%",
        isNew: true,
      },
      {
        className: "text-label-3-semibold",
        name: "Label 3",
        weight: "SemiBold (600)",
        metric: "12px / 140%",
        tracking: "0%",
      },
      {
        className: "text-label-3-medium",
        name: "Label 3",
        weight: "Medium (500)",
        metric: "12px / 140%",
        tracking: "0%",
        isNew: true,
      },
      {
        className: "text-label-4-medium",
        name: "Label 4",
        weight: "Medium (500)",
        metric: "10px / 150%",
        tracking: "0%",
      },
      {
        className: "text-label-4-regular",
        name: "Label 4",
        weight: "Regular (400)",
        metric: "10px / 150%",
        tracking: "0%",
        isNew: true,
      },
    ],
  },
  {
    title: "Caption",
    items: [
      {
        className: "text-caption-1-semibold",
        name: "Caption 1",
        weight: "SemiBold (600)",
        metric: "13px / 145%",
        tracking: "0%",
        isNew: true,
      },
      {
        className: "text-caption-1-medium",
        name: "Caption 1",
        weight: "Medium (500)",
        metric: "13px / 145%",
        tracking: "0%",
      },
      {
        className: "text-caption-2-medium",
        name: "Caption 2",
        weight: "Medium (500)",
        metric: "12px / 150%",
        tracking: "0%",
      },
      {
        className: "text-caption-2-regular",
        name: "Caption 2",
        weight: "Regular (400)",
        metric: "12px / 150%",
        tracking: "0%",
      },
      {
        className: "text-caption-3-bold",
        name: "Caption 3",
        weight: "Bold (700)",
        metric: "11px / 160%",
        tracking: "0%",
        isNew: true,
      },
      {
        className: "text-caption-3-medium",
        name: "Caption 3",
        weight: "Medium (500)",
        metric: "11px / 160%",
        tracking: "-2%",
      },
      {
        className: "text-caption-3-regular",
        name: "Caption 3",
        weight: "Regular (400)",
        metric: "11px / 160%",
        tracking: "-2%",
      },
    ],
  },
]

const TOTAL = GROUPS.reduce((sum, group) => sum + group.items.length, 0)
const NEW_COUNT = GROUPS.reduce(
  (sum, group) => sum + group.items.filter((item) => item.isNew).length,
  0,
)

function TypographyTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-4-semibold text-teal-gray-900 mb-2">
        Typography Test Page
      </h1>
      <p className="text-body-2-medium text-teal-gray-500 mb-10">
        총 {TOTAL}개 토큰 (신규 {NEW_COUNT}개)
      </p>

      <div className="flex flex-col gap-12">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-heading-6-semibold border-teal-gray-200 mb-4 border-b pb-2 text-teal-600">
              {group.title}
            </h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {group.items.map((item) => (
                <div
                  key={item.className}
                  className="grid grid-cols-[220px_140px_120px_60px_1fr] items-center gap-4 py-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-label-2-medium text-teal-gray-900">
                      {item.name}
                    </span>
                    {item.isNew && (
                      <span className="text-caption-3-bold rounded bg-teal-500 px-1.5 py-0.5 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-caption-2-regular text-teal-gray-500">
                    {item.weight}
                  </span>
                  <span className="text-caption-2-regular text-teal-gray-500">
                    {item.metric}
                  </span>
                  <span className="text-caption-2-regular text-teal-gray-500">
                    {item.tracking}
                  </span>
                  <span className={`${item.className} text-teal-gray-900`}>
                    {SAMPLE}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

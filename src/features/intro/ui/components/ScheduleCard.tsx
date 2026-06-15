type ScheduleItem = {
  phase: string
  label: string
  day: string
  time: string
  filled: boolean
}

type ScheduleColumn = {
  date: string
  items: ScheduleItem[]
}

const COLUMNS: ScheduleColumn[] = [
  {
    date: "6/18",
    items: [
      {
        phase: "1차",
        label: "매칭 지원",
        day: "06월 18일",
        time: "00:00-23:59",
        filled: true,
      },
    ],
  },
  {
    date: "6/19",
    items: [
      {
        phase: "1차",
        label: "매칭 결과 공개",
        day: "06월 19일",
        time: "00:00-12:00",
        filled: false,
      },
      {
        phase: "2차",
        label: "매칭 지원",
        day: "06월 19일",
        time: "12:00-23:59",
        filled: true,
      },
    ],
  },
  {
    date: "6/20",
    items: [
      {
        phase: "2차",
        label: "매칭 결과 공개",
        day: "06월 20일",
        time: "00:00-12:00",
        filled: false,
      },
      {
        phase: "3차",
        label: "매칭 지원",
        day: "06월 20일",
        time: "12:00-23:59",
        filled: true,
      },
    ],
  },
  {
    date: "6/21",
    items: [
      {
        phase: "3차",
        label: "매칭 결과 공개",
        day: "06월 21일",
        time: "00:00-12:00",
        filled: false,
      },
      {
        phase: "랜덤",
        label: "매칭",
        day: "06월 21일",
        time: "12:00-23:59",
        filled: false,
      },
    ],
  },
]

const FILLED_BG =
  "linear-gradient(90deg, rgba(229, 245, 242, 0.5) 0%, rgba(229, 245, 242, 0.5) 100%), linear-gradient(90deg, #f4fbfa 0%, #f4fbfa 100%)"

function ScheduleItemCard({ item }: { item: ScheduleItem }) {
  return (
    <div
      className="flex w-[182.2248px] flex-col items-start rounded-[7.5px] border-l-[7.4px] border-[#63c4b8] pl-[7.4px]"
      style={
        item.filled
          ? { backgroundImage: FILLED_BG }
          : { backgroundColor: "#fbfcfc" }
      }
    >
      <div className="flex w-full flex-col items-start gap-[3.7px] rounded-tr-[7.4px] rounded-br-[7.4px] border-y-[0.925px] border-r-[0.925px] border-[#e5f5f2] px-[12.95px] py-[8.3248px]">
        <div className="flex w-full gap-[5.55px] text-[17.34px] leading-[1.4] font-semibold tracking-[-0.347px]">
          <span className="text-[#0b6b64]">{item.phase}</span>
          <span className="text-[#161919]">{item.label}</span>
        </div>
        <div className="flex w-full gap-[3.7px] text-[11.12px] leading-[1.5] text-[#6f7878]">
          <span className="opacity-80">{item.day}</span>
          <span className="opacity-80">{item.time}</span>
        </div>
      </div>
    </div>
  )
}

export function ScheduleCard() {
  return (
    <div className="relative h-[264.75px] w-[792px] rounded-[15px] border-[0.75px] border-[#d9d9d9] bg-white">
      <div
        className="absolute inset-y-[6.75px] left-[7.5px] w-[777px] rounded-[10.5px] border-[0.75px] border-[#d9d9d9]"
        style={{
          backgroundImage:
            "linear-gradient(-45.7deg, rgba(34,144,132,0.06) 10.8%, rgba(255,255,255,0.2) 29.5%), linear-gradient(139.5deg, rgba(34,144,132,0.1) 5.1%, rgba(255,255,255,0.2) 42.8%), linear-gradient(90deg, rgba(143,255,243,0.08) 0%, rgba(143,255,243,0.08) 100%), #fff",
        }}
      />
      <div className="absolute inset-y-[6.75px] left-[7.5px] flex w-[777px]">
        {COLUMNS.map((col, index) => (
          <div
            key={col.date}
            className="flex flex-1 flex-col items-center gap-[37px] border-[#d9d9d9] pt-[19.5px]"
            style={{
              borderRightWidth: index < COLUMNS.length - 1 ? "0.925px" : 0,
              borderLeftWidth: index === 0 ? "0.925px" : 0,
              opacity: index === 0 ? 1 : 0.95,
            }}
          >
            <p className="text-[21px] leading-none font-medium text-[#404443]">
              {col.date}
            </p>
            <div className="flex flex-col gap-[12.75px]">
              {col.items.map((item) => (
                <ScheduleItemCard key={item.time} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="absolute bottom-[-24px] left-0 text-[12px] leading-none font-medium text-[#9ca3a3]">
        * 날짜와 시간은 예시이며, 변동될 수 있습니다.
      </p>
    </div>
  )
}

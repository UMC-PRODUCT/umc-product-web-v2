import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-09.webp"

export function ManualContent09() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[411px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium text-[#36d3c0]">
          # 6 사용자 경험 조사
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            여섯째, 서비스 이용 경험을 자유롭게 공유해요
          </p>
          <p className="leading-[1.6] font-normal">
            더 나은 서비스를 위해 많은 참여 부탁드려요 !
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={464}
          className="w-[650px] flex-none rounded-[10.78px]"
        />
        <div className="flex w-[408.75px] flex-col items-start gap-[39px]">
          <div className="rounded-[9px] bg-[#0b6b64] px-[12px] py-[6px]">
            <p className="text-[18px] font-semibold tracking-[-0.36px] text-white">
              사용자 만족도 조사
            </p>
          </div>
          <div className="flex items-start gap-[12px]">
            <div className="flex size-[22.5px] flex-none items-center justify-center rounded-full bg-[#0b6b64]">
              <span className="text-[15px] leading-none font-medium tracking-[-0.3px] text-white">
                1
              </span>
            </div>
            <div className="flex flex-col gap-[7.5px]">
              <p className="text-[19.5px] leading-[1.2] font-semibold tracking-[-0.39px] whitespace-nowrap text-white">
                서비스 경험
              </p>
              <p className="text-[15px] leading-[1.4] font-medium tracking-[-0.3px] whitespace-pre-wrap text-[#d3d8d8]">
                {
                  "매칭 과정에서 불편했던 점이나 좋았던 점을 자유롭게 남겨주세요.\n더 나은 서비스를 만드는 데 큰 힘이 되니, 많은 참여 부탁드려요!"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

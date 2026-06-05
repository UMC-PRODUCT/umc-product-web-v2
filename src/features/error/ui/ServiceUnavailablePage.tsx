import errorCone from "@/shared/assets/icon/error/error-cone.svg"

export function ServiceUnavailablePage() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(-63.18deg, rgba(34, 144, 132, 0.06) 10.77%, rgba(255, 255, 255, 0.2) 29.55%), linear-gradient(121.23deg, rgba(34, 144, 132, 0.1) 5.09%, rgba(255, 255, 255, 0.2) 42.81%), linear-gradient(90deg, rgba(143, 255, 243, 0.08) 0%, rgba(143, 255, 243, 0.08) 100%), linear-gradient(90deg, #fff 0%, #fff 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-11.5">
        <img src={errorCone} alt="" width={192} height={180} />

        <div className="flex flex-col items-center gap-4.5 text-center">
          <h1 className="text-display-2-medium font-bold text-teal-500">
            서비스 준비 중입니다.
          </h1>
          <p className="text-subtitle-1-medium text-teal-gray-600">
            더 나은 매칭 경험을 제공하기 위해 준비 중입니다.
            <br />
            매칭 기간에 새로운 모습으로 찾아뵙겠습니다!
          </p>
        </div>
      </div>
    </div>
  )
}

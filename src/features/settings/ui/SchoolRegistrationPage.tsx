import { type ChangeEvent, useEffect, useRef, useState } from "react"

import {
  showRequiredFieldsMissingToast,
  showSchoolAlreadyExistsToast,
  showSchoolDeletedToast,
  showSchoolEditCompletedToast,
  showSchoolRegisterCompletedToast,
} from "@/features/settings/model/schoolToasts"
import CloudUploadIcon from "@/shared/assets/icon/upload/CloudUploadIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

interface SchoolRegistrationPageProps {
  mode?: "register" | "edit"
  schoolId?: string
}

export function SchoolRegistrationPage({
  mode = "register",
  schoolId,
}: SchoolRegistrationPageProps) {
  const isEditMode = mode === "edit"
  const addToast = useToastStore((s) => s.addToast)

  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openResetModal, setOpenResetModal] = useState(false)

  const [officialName, setOfficialName] = useState("")
  const [shortName, setShortName] = useState("")
  const [instagram, setInstagram] = useState("")
  const [youtube, setYoutube] = useState("")
  const [kakao, setKakao] = useState("")
  const [memo, setMemo] = useState("")

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoPreviewRef = useRef<string | null>(null)
  logoPreviewRef.current = logoPreview

  useEffect(() => {
    return () => {
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current)
      }
    }
  }, [])

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
      setLogoPreview(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReset = () => {
    setOfficialName("")
    setShortName("")
    setInstagram("")
    setYoutube("")
    setKakao("")
    setMemo("")
    handleRemoveLogo()
  }

  const handleSave = () => {
    if (!officialName.trim() || !shortName.trim()) {
      showRequiredFieldsMissingToast(addToast)
      return
    }

    if (officialName.trim() === "가가대학교") {
      showSchoolAlreadyExistsToast(addToast)
      return
    }

    if (isEditMode) {
      showSchoolEditCompletedToast(addToast)
    } else {
      showSchoolRegisterCompletedToast(addToast)
    }

    if (process.env.NODE_ENV === "development") {
      console.log({
        schoolId,
        officialName,
        shortName,
        logoFile,
        instagram,
        youtube,
        kakao,
        memo,
      })
    }
  }

  const handleDeleteConfirm = () => {
    showSchoolDeletedToast(addToast, () => {
      if (process.env.NODE_ENV === "development") {
        console.log("School deletion undone", schoolId)
      }
    })

    if (process.env.NODE_ENV === "development") {
      console.log("Deleting school", schoolId)
    }
  }

  return (
    <div className="flex w-full max-w-244 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "school", label: "학교 관리", to: "/manage/school" },
          {
            id: "school-register",
            label: isEditMode ? "한양대 ERICA" : "학교 등록",
          },
        ]}
        title={isEditMode ? "한양대학교 ERICA" : "학교 등록"}
        className="pl-3"
      />

      <div className="border-teal-gray-150 box-border flex w-full flex-col gap-6 rounded-[14px] border bg-white px-8 py-8.5">
        <div className="flex w-full flex-col gap-14">
          {/* Section 01: 학교 이름 */}
          <div className="flex w-full gap-3.5">
            <span className="text-heading-7-semibold text-teal-600">01</span>

            <div className="flex w-full flex-col gap-4">
              <h2 className="text-heading-7-semibold text-teal-gray-900">
                학교 이름<span className="text-error-600 pl-px">*</span>
              </h2>
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full flex-col gap-3">
                  <div className="flex w-full items-center gap-6">
                    <label
                      htmlFor="official-name"
                      className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                    >
                      공식 이름
                    </label>
                    <InputBox
                      id="official-name"
                      value={officialName}
                      onChange={(e) => setOfficialName(e.target.value)}
                      placeholder="한국대학교"
                      className="w-full max-w-105"
                    />
                  </div>

                  <div className="flex w-full items-center gap-6">
                    <label
                      htmlFor="short-name"
                      className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                    >
                      약칭
                    </label>
                    <InputBox
                      id="short-name"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      placeholder="한국대"
                      className="w-full max-w-105"
                    />
                  </div>
                </div>

                <p className="text-body-2-medium text-teal-gray-400 pl-22">
                  * 예시: 한국대학교 &rarr; 한국대
                </p>
              </div>
            </div>
          </div>

          {/* Section 02: 학교 대표 로고 */}
          <div className="flex w-full gap-3.5">
            <span className="text-heading-7-semibold text-teal-600">02</span>

            <div className="flex flex-col gap-4">
              <h2 className="text-heading-7-semibold text-teal-gray-900">
                학교 대표 로고<span className="text-error-600 pl-px">*</span>
              </h2>

              <div className="flex items-center gap-6.5 py-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-teal-gray-400 relative flex size-30 shrink-0 flex-col items-center justify-center gap-[4.8px] overflow-hidden rounded-[19px] outline-none"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="학교 로고 미리보기"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <CloudUploadIcon className="text-teal-gray-150 size-7.5" />
                      <div className="flex flex-col items-center justify-center gap-[2.4px]">
                        <span className="text-body-1-medium text-white">
                          클릭 후 업로드
                        </span>
                        <span className="text-label-4-regular text-teal-gray-100">
                          PNG, SVG 형식의
                          <br />
                          5MB 이하 파일
                        </span>
                      </div>
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-4">
                  <div className="text-body-2-medium text-teal-gray-400 flex gap-1">
                    <span className="shrink-0">*</span>
                    <p>
                      PNG, SVG 형식의 5MB 이하 파일만 올릴 수 있습니다.
                      <br />
                      투명한 배경의 이미지를 권장합니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="xs"
                      color="primary"
                      variant="weak"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-fit px-3"
                    >
                      이미지 변경
                    </Button>
                    <Button
                      size="xs"
                      color="neutral"
                      variant="weak"
                      onClick={handleRemoveLogo}
                      className="w-fit px-3"
                    >
                      이미지 삭제
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          </div>

          {/* Section 03: 외부 링크 (선택) */}
          <div className="flex w-full gap-3.5">
            <span className="text-heading-7-semibold text-teal-600">03</span>

            <div className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-heading-7-semibold text-teal-gray-900">
                  외부 링크 (선택)
                </h2>
                <p className="text-body-2-medium text-teal-gray-400">
                  * 학교 공식 SNS의 링크를 입력하세요. 인스타그램, 유튜브,
                  카카오 링크만 입력 가능합니다.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full items-center gap-4">
                  <label
                    htmlFor="instagram-link"
                    className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                  >
                    Instagram
                  </label>
                  <InputBox
                    id="instagram-link"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="공식 인스타그램 주소를 입력하세요 (선택)"
                    className="w-full max-w-105"
                  />
                </div>

                <div className="flex w-full items-center gap-4">
                  <label
                    htmlFor="youtube-link"
                    className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                  >
                    Youtube
                  </label>
                  <InputBox
                    id="youtube-link"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="공식 유튜브 주소를 입력하세요 (선택)"
                    className="w-full max-w-105"
                  />
                </div>

                <div className="flex w-full items-center gap-4">
                  <label
                    htmlFor="kakao-link"
                    className="text-body-1-medium text-teal-gray-600 w-18 shrink-0"
                  >
                    Kakao
                  </label>
                  <InputBox
                    id="kakao-link"
                    value={kakao}
                    onChange={(e) => setKakao(e.target.value)}
                    placeholder="공식 카카오 채널 주소를 입력하세요 (선택)"
                    className="w-full max-w-105"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 04: 메모 사항 */}
          <div className="flex w-full gap-3.5">
            <span className="text-heading-7-semibold text-teal-600">04</span>

            <div className="flex w-full flex-col gap-4 pr-8.5">
              <h2 className="text-heading-7-semibold text-teal-gray-900">
                메모 사항
              </h2>

              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="작성하세요"
                className="border-teal-gray-200 shadow-inner-neutral-2 box-border min-h-49.5 w-full resize-none rounded-[12px] border bg-white py-3.5 pr-3 pl-4 text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between">
          {isEditMode ? (
            <Button
              size="m"
              color="red"
              variant="weak"
              onClick={() => setOpenDeleteModal(true)}
              className="rounded-[10px]"
            >
              학교 삭제
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Button
              size="m"
              color="neutral"
              variant="weak"
              onClick={() => setOpenResetModal(true)}
              className="rounded-[10px]"
            >
              초기화
            </Button>
            <Button
              size="m"
              color="primary"
              variant="fill"
              onClick={handleSave}
              className="rounded-[10px]"
            >
              저장
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <CtaModal
        open={openDeleteModal}
        variant="error"
        title="등록된 학교를 삭제하시겠습니까?"
        content="삭제한 학교 정보는 되돌릴 수 없습니다."
        cancelText="돌아가기"
        confirmText="삭제하기"
        onOpenChange={setOpenDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          setOpenDeleteModal(false)
          handleDeleteConfirm()
        }}
      />

      {/* Reset Confirmation Modal */}
      <CtaModal
        open={openResetModal}
        variant="warning"
        title="등록된 학교 정보를 초기화 하시겠습니까?"
        content="변경된 학교 정보는 되돌릴 수 없습니다."
        cancelText="돌아가기"
        confirmText="초기화하기"
        onOpenChange={setOpenResetModal}
        onCancel={() => setOpenResetModal(false)}
        onConfirm={() => {
          setOpenResetModal(false)
          handleReset()
        }}
      />
    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router"

import CircleBang from "@/shared/assets/icon/bang/CircleBang"
import CheckBoxIcon from "@/shared/assets/icon/check/CheckBoxIcon"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import CircleCheckIcon from "@/shared/assets/icon/check/CircleCheckIcon"
import TypeCheckSizeSm from "@/shared/assets/icon/check/TypeCheckSizeSm"
import FilterDropDownIcon from "@/shared/assets/icon/chevron/FilterDropDownIcon"
import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import NoticePublishLeftChevronIcon from "@/shared/assets/icon/chevron/NoticePublish/LeftChevronIcon"
import PaginationLeftChevronIcon from "@/shared/assets/icon/chevron/pagination/LeftChevronIcon"
import PaginationRightChevronIcon from "@/shared/assets/icon/chevron/pagination/RightChevronIcon"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import DragAndDrop from "@/shared/assets/icon/drag-and-drop/DragAndDrop"
import EyeClosed from "@/shared/assets/icon/eye/EyeClosed"
import EyeOpen from "@/shared/assets/icon/eye/EyeOpen"
import TrashCan from "@/shared/assets/icon/garbage/TrashCan"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import MinusIcon from "@/shared/assets/icon/minus/MinusIcon"
import PersonButtonIcon from "@/shared/assets/icon/people/PersonButtonIcon"
import PersonIcon from "@/shared/assets/icon/people/PersonIcon"
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import TeamIcon from "@/shared/assets/icon/people/TeamIcon"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import ToggleCheckboxIcon from "@/shared/assets/icon/toggle/ToggleCheckboxIcon"
import ToggleFileUploadIcon from "@/shared/assets/icon/toggle/ToggleFileUploadIcon"
import ToggleRadioIcon from "@/shared/assets/icon/toggle/ToggleRadioIcon"
import ToggleTextIcon from "@/shared/assets/icon/toggle/ToggleTextIcon"
import FileClip from "@/shared/assets/icon/upload/FileClip"
import UploadImageIcon from "@/shared/assets/icon/upload/UploadImageIcon"

import type { ReactNode } from "react"

export const Route = createFileRoute("/test/icon")({
  component: IconTestPage,
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      <div className="flex flex-wrap gap-3">{children}</div>
    </section>
  )
}

function IconCard({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="border-teal-gray-200 flex w-[100px] flex-col items-center gap-2 rounded-lg border bg-white px-2 py-4">
      <div className="text-teal-gray-900 flex h-8 w-8 items-center justify-center">
        {children}
      </div>
      <span className="text-teal-gray-400 text-label-2-medium w-full text-center leading-tight break-all">
        {name}
      </span>
    </div>
  )
}

function IconTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Icon Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="bang">
          <IconCard name="CircleBang">
            <CircleBang width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="check">
          <IconCard name="CheckIcon">
            <CheckIcon width={24} height={24} />
          </IconCard>
          <IconCard name="CheckBoxIcon">
            <CheckBoxIcon />
          </IconCard>
          <IconCard name="CircleCheckIcon">
            <CircleCheckIcon width={24} height={24} />
          </IconCard>
          <IconCard name="TypeCheckSizeSm">
            <TypeCheckSizeSm width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="chevron">
          <IconCard name="LeftChevronIcon">
            <LeftChevronIcon width={24} height={24} />
          </IconCard>
          <IconCard name="FilterDropDownIcon">
            <FilterDropDownIcon width={24} height={24} />
          </IconCard>
          <IconCard name="PaginationLeft ChevronIcon">
            <PaginationLeftChevronIcon width={24} height={24} />
          </IconCard>
          <IconCard name="PaginationRight ChevronIcon">
            <PaginationRightChevronIcon width={24} height={24} />
          </IconCard>
          <IconCard name="DownChevronIcon (sidebar)">
            <DownChevronIcon width={24} height={24} />
          </IconCard>
          <IconCard name="NoticePublish LeftChevronIcon">
            <NoticePublishLeftChevronIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="close">
          <IconCard name="CloseIcon">
            <CloseIcon width={24} height={24} />
          </IconCard>
          <IconCard name="CloseCircleIcon">
            <CloseCircleIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="drag-and-drop">
          <IconCard name="DragAndDrop">
            <DragAndDrop width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="eye">
          <IconCard name="EyeOpen">
            <EyeOpen width={24} height={24} />
          </IconCard>
          <IconCard name="EyeClosed">
            <EyeClosed width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="garbage">
          <IconCard name="TrashCan">
            <TrashCan width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="infomation">
          <IconCard name="InfoCircleIcon">
            <InfoCircleIcon width={24} height={24} />
          </IconCard>
          <IconCard name="WarningTriangleIcon">
            <WarningTriangleIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="logo">
          <IconCard name="UmcLogo">
            <UmcLogo width={60} height={20} />
          </IconCard>
          <IconCard name="ProjectLogo (no src)">
            <ProjectLogo />
          </IconCard>
          <IconCard name="ProjectLogo (src)">
            <ProjectLogo src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%230E8179'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='white'%3EP%3C/text%3E%3C/svg%3E" />
          </IconCard>
        </Section>

        <Section title="minus / plus">
          <IconCard name="MinusIcon">
            <MinusIcon width={24} height={24} />
          </IconCard>
          <IconCard name="PlusIcon">
            <PlusIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="people">
          <IconCard name="PersonIcon">
            <PersonIcon width={24} height={24} />
          </IconCard>
          <IconCard name="PersonButtonIcon">
            <PersonButtonIcon width={24} height={24} />
          </IconCard>
          <IconCard name="TeamIcon">
            <TeamIcon width={24} height={24} />
          </IconCard>
          <IconCard name="ProfileIcon">
            <ProfileIcon width={40} height={40} />
          </IconCard>
        </Section>

        <Section title="search">
          <IconCard name="SearchIcon">
            <SearchIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="toggle">
          <IconCard name="ToggleCheckbox Icon">
            <ToggleCheckboxIcon width={24} height={24} />
          </IconCard>
          <IconCard name="ToggleRadioIcon">
            <ToggleRadioIcon width={24} height={24} />
          </IconCard>
          <IconCard name="ToggleTextIcon">
            <ToggleTextIcon width={24} height={24} />
          </IconCard>
          <IconCard name="ToggleFileUpload Icon">
            <ToggleFileUploadIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="upload">
          <IconCard name="FileClip">
            <FileClip width={24} height={24} />
          </IconCard>
          <IconCard name="UploadImageIcon">
            <UploadImageIcon width={24} height={24} />
          </IconCard>
        </Section>

        <Section title="currentColor 적용 (text-teal-500)">
          <div className="flex flex-wrap gap-3 text-teal-500">
            <IconCard name="CheckIcon">
              <CheckIcon width={24} height={24} />
            </IconCard>
            <IconCard name="CircleCheckIcon">
              <CircleCheckIcon width={24} height={24} />
            </IconCard>
            <IconCard name="LeftChevronIcon">
              <LeftChevronIcon width={24} height={24} />
            </IconCard>
            <IconCard name="CloseIcon">
              <CloseIcon width={24} height={24} />
            </IconCard>
            <IconCard name="TrashCan">
              <TrashCan width={24} height={24} />
            </IconCard>
            <IconCard name="InfoCircleIcon">
              <InfoCircleIcon width={24} height={24} />
            </IconCard>
            <IconCard name="PlusIcon">
              <PlusIcon width={24} height={24} />
            </IconCard>
            <IconCard name="SearchIcon">
              <SearchIcon width={24} height={24} />
            </IconCard>
          </div>
        </Section>
      </div>
    </main>
  )
}

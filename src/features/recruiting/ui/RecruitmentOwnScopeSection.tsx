import { RecruitmentCreateButton } from "./RecruitmentCreateButton"
import { RecruitmentDraftArchiveCard } from "./RecruitmentDraftArchiveCard"
import { RecruitmentPostListCard } from "./RecruitmentPostListCard"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingListRole } from "../model/recruitingListRole"
import type {
  DuplicateOutcome,
  DuplicateTargetSeason,
  RecruitmentPost,
} from "../model/recruitmentList"

interface RecruitmentOwnScopeSectionProps {
  chapter: Chapter
  role: RecruitingListRole
  posts: RecruitmentPost[]
  schoolTab: string
  permittedSeasonIds: ReadonlySet<string>
  duplicateCandidateSeasons: DuplicateTargetSeason[]
  onPrivatize: (postId: string) => Promise<void>
  onPublish: (postId: string) => Promise<void>
  onDuplicate: (
    postId: string,
    targetSeasonIds?: string[],
  ) => Promise<DuplicateOutcome>
  onDelete: (postId: string) => void
  onUndoDelete: () => void
  onNavigateToArchive: (school: string) => void
  archiveVisible: boolean
  archiveTitle?: string
  onCreate?: () => void
}

// chapterAdmin(본인 지부 전체)과 schoolStaff(본인 학교)가 공유하는 "내 스코프" 목록 + 공유 보관함 섹션
export function RecruitmentOwnScopeSection({
  chapter,
  role,
  posts,
  schoolTab,
  permittedSeasonIds,
  duplicateCandidateSeasons,
  onPrivatize,
  onPublish,
  onDuplicate,
  onDelete,
  onUndoDelete,
  onNavigateToArchive,
  archiveVisible,
  archiveTitle,
  onCreate,
}: RecruitmentOwnScopeSectionProps) {
  const heading = schoolTab === "all" ? chapter : schoolTab

  return (
    <section className="mt-8 flex flex-col">
      <div className="flex items-end justify-between px-3">
        <h2 className="text-heading-5-semibold text-teal-700">{heading}</h2>
        {onCreate && schoolTab !== "all" && (
          <RecruitmentCreateButton
            onClick={onCreate}
            className="translate-y-1"
          />
        )}
      </div>
      <RecruitmentPostListCard
        chapter={chapter}
        role={role}
        posts={posts}
        permittedSeasonIds={permittedSeasonIds}
        duplicateCandidateSeasons={duplicateCandidateSeasons}
        onPrivatize={onPrivatize}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onUndoDelete={onUndoDelete}
        onNavigateToArchive={onNavigateToArchive}
        archiveVisibleOnPage={archiveVisible}
        schoolFilterActive={schoolTab !== "all"}
        className="mt-5"
      />
      {archiveVisible && (
        <div className="mt-11 flex flex-col gap-5">
          <h2 className="text-heading-5-semibold pl-3 text-teal-700">
            {heading}
          </h2>
          <RecruitmentDraftArchiveCard
            chapter={chapter}
            role={role}
            posts={posts}
            permittedSeasonIds={permittedSeasonIds}
            duplicateCandidateSeasons={duplicateCandidateSeasons}
            onPublish={onPublish}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onUndoDelete={onUndoDelete}
            selectedSchool={schoolTab === "all" ? null : schoolTab}
            title={archiveTitle}
          />
        </div>
      )}
    </section>
  )
}

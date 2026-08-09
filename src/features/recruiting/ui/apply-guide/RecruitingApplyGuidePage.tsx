import {
  APPLY_GUIDE_NOTICE,
  APPLY_GUIDE_QA_ITEMS,
} from "@/features/recruiting/model/applyGuide"

import { ApplyGuideCard } from "./ApplyGuideCard"

/** 브레드크럼·타이틀·사이드바는 `/projects` 레이아웃이 그린다. 여기는 본문만 둔다. */
export function RecruitingApplyGuidePage() {
  return (
    <div className="w-full max-w-241">
      <ApplyGuideCard
        notice={APPLY_GUIDE_NOTICE}
        qaItems={APPLY_GUIDE_QA_ITEMS}
      />
    </div>
  )
}

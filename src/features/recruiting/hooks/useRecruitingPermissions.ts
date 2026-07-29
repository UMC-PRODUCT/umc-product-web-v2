import { useMemo } from "react"

import { useResourcePermissionsBatch } from "@/entities/member/hooks/useResourcePermissionsBatch"

// 모집 관리 권한은 시즌(학교×기수) 단위로 판정된다. 역할 타입으로 흉내 내면
// 서버가 허용하는 범위와 어긋나므로 권한 조회 결과를 그대로 쓴다.
export function useRecruitingPermissions(seasonIds: string[]) {
  const seasonKey = [...new Set(seasonIds)].sort().join(",")

  const resourceIds = useMemo(
    () =>
      seasonKey
        .split(",")
        .filter(Boolean)
        .map(Number)
        .filter((id) => Number.isFinite(id)),
    [seasonKey],
  )

  const query = useResourcePermissionsBatch(
    [
      {
        resourceType: "RECRUITMENT",
        resourceIds,
        permissionTypes: ["EDIT"],
      },
    ],
    { enabled: resourceIds.length > 0 },
  )

  const { hasPermission } = query
  const permittedSeasonIds = useMemo(() => {
    const permitted = new Set<string>()
    resourceIds.forEach((resourceId) => {
      if (
        hasPermission({
          resourceType: "RECRUITMENT",
          resourceId,
          permissionType: "EDIT",
        })
      ) {
        permitted.add(String(resourceId))
      }
    })
    return permitted
    // hasPermission 은 매 렌더 새로 만들어지므로 응답 데이터를 의존성으로 쓴다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, resourceIds])

  return {
    permittedSeasonIds,
    isLoading: query.isLoading,
    // 재조회가 실패해도 앞서 받은 결과는 남는다. 실패를 곧 판정 불가로 접으면
    // 창에 다시 들어올 때마다 권한이 사라져 버튼이 잠긴다.
    isUnresolved: query.isError && query.data === undefined,
  }
}

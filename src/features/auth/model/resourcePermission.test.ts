import { describe, expect, it } from "vitest"

import {
  hasGrantedPermission,
  hasGrantedResourcePermission,
} from "./resourcePermission"

import type { ResourcePermissionResponse } from "@/features/auth/api/permissions"

describe("hasGrantedPermission", () => {
  it("권한 응답이 없으면 false", () => {
    expect(hasGrantedPermission(undefined, "EDIT")).toBe(false)
  })

  it("hasPermission true인 권한만 true", () => {
    const response: ResourcePermissionResponse = {
      resourceType: "PROJECT",
      resourceId: 1,
      permissions: [
        { permissionType: "EDIT", hasPermission: true },
        { permissionType: "DELETE", hasPermission: false },
      ],
    }

    expect(hasGrantedPermission(response, "EDIT")).toBe(true)
    expect(hasGrantedPermission(response, "DELETE")).toBe(false)
    expect(hasGrantedPermission(response, "MANAGE")).toBe(false)
  })
})

describe("hasGrantedResourcePermission", () => {
  const responses: ResourcePermissionResponse[] = [
    {
      resourceType: "PROJECT",
      resourceId: 1,
      permissions: [{ permissionType: "EDIT", hasPermission: true }],
    },
    {
      resourceType: "PROJECT",
      resourceId: 2,
      permissions: [{ permissionType: "EDIT", hasPermission: false }],
    },
    {
      resourceType: "PROJECT_APPLICATION",
      resourceId: 1,
      permissions: [{ permissionType: "APPROVE", hasPermission: true }],
    },
  ]

  it("resourceType과 resourceId가 모두 일치해야 true", () => {
    expect(
      hasGrantedResourcePermission(responses, {
        resourceType: "PROJECT",
        resourceId: 1,
        permissionType: "EDIT",
      }),
    ).toBe(true)
  })

  it("resourceId가 다른 결과는 false", () => {
    expect(
      hasGrantedResourcePermission(responses, {
        resourceType: "PROJECT",
        resourceId: 2,
        permissionType: "EDIT",
      }),
    ).toBe(false)
  })

  it("resourceType이 다른 결과는 false", () => {
    expect(
      hasGrantedResourcePermission(responses, {
        resourceType: "PROJECT",
        resourceId: 1,
        permissionType: "APPROVE",
      }),
    ).toBe(false)
  })

  it("서버가 문자열 resourceId를 반환해도 number 조회와 매칭된다 (id 타입 불일치 회귀 방지)", () => {
    const stringIdResponses = [
      {
        resourceType: "PROJECT",
        resourceId: "92",
        permissions: [{ permissionType: "EDIT", hasPermission: true }],
      },
    ] as unknown as ResourcePermissionResponse[]

    expect(
      hasGrantedResourcePermission(stringIdResponses, {
        resourceType: "PROJECT",
        resourceId: 92,
        permissionType: "EDIT",
      }),
    ).toBe(true)
  })
})

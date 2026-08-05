import { describe, expect, it } from "vitest"
import {
  buildPastoralCouncilPositionTree,
  createsPastoralCouncilPositionCycle,
  type PastoralCouncilListItemDto,
  type PastoralCouncilPositionDto,
} from "./pastoral-council.types"

function position(
  id: string,
  parentId: string | null,
  sortOrder: number,
): PastoralCouncilPositionDto {
  return {
    id,
    title: id,
    parentId,
    sortOrder,
    isActive: true,
    defaultPlaceholderImageType: "MAN",
    memberCount: 0,
    createdAt: "2026-08-05T00:00:00.000Z",
  }
}

function member(
  id: string,
  positionId: string,
  sortOrder: number,
): PastoralCouncilListItemDto {
  return {
    id,
    positionId,
    positionTitle: positionId,
    name: id,
    baptismalName: null,
    phone: null,
    imageUrl: null,
    placeholderImageType: "MAN",
    sortOrder,
    isActive: true,
    createdAt: "2026-08-05T00:00:00.000Z",
  }
}

describe("buildPastoralCouncilPositionTree", () => {
  it("부모 관계와 노출 순서에 따라 직책과 구성원을 정렬한다", () => {
    const roots = buildPastoralCouncilPositionTree({
      positions: [
        position("child-b", "root", 20),
        position("root", null, 10),
        position("child-a", "root", 10),
      ],
      members: [
        member("member-b", "child-a", 20),
        member("member-a", "child-a", 10),
      ],
    })

    expect(roots.map((node) => node.id)).toEqual(["root"])
    expect(roots[0]?.children.map((node) => node.id)).toEqual([
      "child-a",
      "child-b",
    ])
    expect(roots[0]?.children[0]?.members.map((item) => item.id)).toEqual([
      "member-a",
      "member-b",
    ])
  })
})

describe("createsPastoralCouncilPositionCycle", () => {
  const positions = [
    position("root", null, 0),
    position("child", "root", 0),
    position("grandchild", "child", 0),
  ]

  it("자신 또는 하위 직책을 부모로 지정하는 요청을 차단한다", () => {
    expect(
      createsPastoralCouncilPositionCycle({
        positionId: "root",
        parentId: "grandchild",
        positions,
      }),
    ).toBe(true)
    expect(
      createsPastoralCouncilPositionCycle({
        positionId: "child",
        parentId: "child",
        positions,
      }),
    ).toBe(true)
  })

  it("다른 가지나 최상위로 이동하는 요청은 허용한다", () => {
    expect(
      createsPastoralCouncilPositionCycle({
        positionId: "grandchild",
        parentId: "root",
        positions,
      }),
    ).toBe(false)
    expect(
      createsPastoralCouncilPositionCycle({
        positionId: "child",
        parentId: null,
        positions,
      }),
    ).toBe(false)
  })
})

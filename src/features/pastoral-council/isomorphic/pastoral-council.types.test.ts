import { describe, expect, it } from "vitest"
import {
  buildPastoralCouncilPositionTree,
  createsPastoralCouncilPositionCycle,
  isPastoralCouncilPositionVisible,
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
    childrenLayout: "AUTO",
    childrenColumns: 2,
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

  it("실제 구성원이 있는 하위 경로만 유지하고 공석뿐인 가지는 숨긴다", () => {
    const roots = buildPastoralCouncilPositionTree({
      positions: [
        position("middle", null, 0),
        position("vacant-leaf", "middle", 0),
        position("occupied-leaf", "middle", 1),
        position("vacant-middle", "middle", 2),
        position("vacant-grandchild", "vacant-middle", 0),
      ],
      members: [member("occupied-member", "occupied-leaf", 0)],
    })
    const root = roots[0]
    const vacantMiddle = root?.children.find(
      (node) => node.id === "vacant-middle",
    )

    expect(root && isPastoralCouncilPositionVisible(root)).toBe(true)
    expect(
      root?.children
        .filter(isPastoralCouncilPositionVisible)
        .map((node) => node.id),
    ).toEqual(["occupied-leaf"])
    expect(vacantMiddle && isPastoralCouncilPositionVisible(vacantMiddle)).toBe(
      false,
    )
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

// 기존 자유 게시판을 공개 화면에 노출되지 않는 보관 카테고리로 이관한다.
process.env.LEGACY_BOARD_TABLE = "bbs"
process.env.LEGACY_LAST_PAGE = "1"

import("./migrate-legacy-pds").catch((error) => {
  console.error(error)
  process.exitCode = 1
})

export {}

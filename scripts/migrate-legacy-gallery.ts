// 사진갤러리 게시판 파라미터와 페이지 범위를 고정한다.
process.env.LEGACY_BOARD_TABLE = "gallery"
process.env.LEGACY_LAST_PAGE = "5"

import("./migrate-legacy-pds").catch((error) => {
  console.error(error)
  process.exitCode = 1
})

export {}

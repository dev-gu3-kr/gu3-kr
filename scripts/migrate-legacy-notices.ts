// 실제 공지사항 게시판 파라미터를 고정해 자료실 이관과 분리한다.
process.env.LEGACY_BOARD_TABLE = "notice"
process.env.LEGACY_LAST_PAGE = "4"

import("./migrate-legacy-pds").catch((error) => {
  console.error(error)
  process.exitCode = 1
})

export {}

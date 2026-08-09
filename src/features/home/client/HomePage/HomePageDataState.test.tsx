import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  HomePageDataErrorState,
  HomePageDataLoadingState,
} from "./HomePageDataState"

describe("HomePageDataState", () => {
  it("renders skeletons without sample board content while data is pending", () => {
    const markup = renderToStaticMarkup(<HomePageDataLoadingState />)

    expect(markup).toContain("홈 화면 소식을 불러오는 중")
    expect(markup).not.toContain("제목이 여기에 들어갑니다")
  })

  it("renders an accessible retry action after the initial request fails", () => {
    const markup = renderToStaticMarkup(
      <HomePageDataErrorState onRetry={() => undefined} />,
    )

    expect(markup).toContain('role="alert"')
    expect(markup).toContain("다시 불러오기")
  })
})

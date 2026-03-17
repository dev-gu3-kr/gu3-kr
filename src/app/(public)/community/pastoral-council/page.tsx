import { SubLanding } from "@/components/SubLanding"
import { PastoralCouncilPageContainer } from "@/features/pastoral-council/client"

export default async function Page() {
  return (
    <>
      <SubLanding
        title=""
        sectionLabel="공동체 마당"
        currentLabel="사목협의회"
      />

      <PastoralCouncilPageContainer />
    </>
  )
}

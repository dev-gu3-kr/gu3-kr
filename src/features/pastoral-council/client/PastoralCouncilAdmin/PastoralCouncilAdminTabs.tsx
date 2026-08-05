"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PastoralCouncilCreateButton } from "../PastoralCouncilCreateButton/PastoralCouncilCreateButton"
import { PastoralCouncilListContainer } from "../PastoralCouncilListContainer"
import { PastoralCouncilPageContainer } from "../PastoralCouncilPage/PastoralCouncilPageContainer"
import { PastoralCouncilPositionManager } from "./PastoralCouncilPositionManager"

export function PastoralCouncilAdminTabs() {
  return (
    <Tabs defaultValue="positions" className="gap-6">
      <TabsList className="w-full justify-start overflow-x-auto" variant="line">
        <TabsTrigger value="positions">직책 관리</TabsTrigger>
        <TabsTrigger value="members">구성원 관리</TabsTrigger>
        <TabsTrigger value="preview">공개 미리보기</TabsTrigger>
      </TabsList>

      <TabsContent value="positions">
        <PastoralCouncilPositionManager />
      </TabsContent>

      <TabsContent value="members">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">구성원 배정</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                구성원을 등록하고 담당 직책을 선택합니다.
              </p>
            </div>
            <PastoralCouncilCreateButton />
          </div>
          <PastoralCouncilListContainer />
        </div>
      </TabsContent>

      <TabsContent value="preview">
        <div className="rounded-3xl border bg-background p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="font-semibold">공개 화면 미리보기</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              현재 공개 중인 직책과 구성원만 표시됩니다.
            </p>
          </div>
          <PastoralCouncilPageContainer />
        </div>
      </TabsContent>
    </Tabs>
  )
}

import { InquiryListContainer } from "@/features/inquiries/client"

export default function AdminInquiriesPage() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">1:1 문의 확인</h1>
        <p className="text-sm text-neutral-600">
          접수된 문의 목록을 확인하고 상세 페이지에서 내용을 검토합니다.
        </p>
      </section>

      <InquiryListContainer />
    </main>
  )
}

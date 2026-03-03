"use client"

import { useEffect, useRef } from "react"

type NoticeWriteFormViewProps = {
  // 공지 작성/수정 폼 제출 핸들러
  onSubmitAction: (formData: FormData) => void
  // 작성/수정 처리 중 여부
  isLoading: boolean
  // 처리 결과 메시지
  message: string | null
  // 에러 상태 여부
  isError: boolean
  // 본문 마크다운 값
  content: string
  // 본문 변경 핸들러
  onContentChangeAction: (nextContent: string) => void
  // 초기 제목 값
  initialTitle?: string
  // 초기 요약 값
  initialSummary?: string
  // 초기 공개 여부
  initialIsPublished?: boolean
  // 제출 버튼 라벨
  submitLabel?: string
}

type ToastEditorLike = {
  getMarkdown: () => string
  setMarkdown: (markdown: string, cursorToEnd?: boolean) => void
  on: (event: "change", handler: () => void) => void
  destroy: () => void
}

export function NoticeWriteFormView({
  onSubmitAction,
  isLoading,
  message,
  isError,
  content,
  onContentChangeAction,
  initialTitle,
  initialSummary,
  initialIsPublished,
  submitLabel = "공지 저장",
}: NoticeWriteFormViewProps) {
  // 에디터를 마운트할 DOM 참조다.
  const mountRef = useRef<HTMLDivElement | null>(null)
  // Toast UI 인스턴스 참조다.
  const editorRef = useRef<ToastEditorLike | null>(null)
  // 최초 마운트 시점의 초기 본문값을 보존한다.
  const initialContentRef = useRef(content)
  // 최신 onContentChange 핸들러를 참조로 유지한다.
  const onContentChangeRef = useRef(onContentChangeAction)

  useEffect(() => {
    onContentChangeRef.current = onContentChangeAction
  }, [onContentChangeAction])

  useEffect(() => {
    let disposed = false

    // 브라우저 환경에서만 Toast UI를 동적 로드해 초기화한다.
    void import("@toast-ui/editor").then((module) => {
      if (disposed || !mountRef.current || editorRef.current) {
        return
      }

      const Editor = module.default
      const editor = new Editor({
        el: mountRef.current,
        height: window.innerWidth < 640 ? "240px" : "360px",
        initialValue: initialContentRef.current || "",
        initialEditType: "wysiwyg",
        previewStyle: "vertical",
        hideModeSwitch: false,
        usageStatistics: false,
      }) as ToastEditorLike

      editor.on("change", () => {
        onContentChangeRef.current(editor.getMarkdown())
      })

      editorRef.current = editor
    })

    return () => {
      disposed = true

      // Toast UI destroy 과정에서 간헐적으로 removeChild(NotFoundError)가 발생해
      // 라우트 전환을 깨뜨리는 케이스가 있어, 참조/DOM만 정리한다.
      editorRef.current = null
      if (mountRef.current) {
        mountRef.current.innerHTML = ""
      }
    }
  }, [])

  useEffect(() => {
    // content가 비워지면 에디터 본문도 초기화한다.
    if (content === "" && editorRef.current) {
      editorRef.current.setMarkdown("", false)
    }
  }, [content])

  return (
    <form action={onSubmitAction} className="min-w-0 space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm">
          제목
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialTitle}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="summary" className="text-sm">
          요약
        </label>
        <input
          id="summary"
          name="summary"
          defaultValue={initialSummary}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm">
          본문
        </label>
        <div ref={mountRef} className="min-w-0 w-full overflow-hidden" />
        {/* 서버 제출용 hidden 필드로 본문 상태를 전달한다. */}
        <input id="content" type="hidden" name="content" value={content} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          value="true"
          defaultChecked={initialIsPublished}
        />
        작성 후 바로 공개
      </label>

      {message ? (
        <p
          className={
            isError ? "text-sm text-red-600" : "text-sm text-emerald-600"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
      >
        {isLoading ? "저장 중..." : submitLabel}
      </button>
    </form>
  )
}

declare module "@toast-ui/editor" {
  type EditorOptions = {
    el: HTMLElement
    height?: string
    initialValue?: string
    initialEditType?: "markdown" | "wysiwyg"
    previewStyle?: "vertical" | "tab"
    hideModeSwitch?: boolean
    usageStatistics?: boolean
  }

  export default class Editor {
    constructor(options: EditorOptions)
    getMarkdown(): string
    setMarkdown(markdown: string, cursorToEnd?: boolean): void
    on(event: "change", handler: () => void): void
    destroy(): void
  }
}

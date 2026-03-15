export type InquiryType =
  | "MASS_SACRAMENT"
  | "CATECHUMEN_CLASS"
  | "FAITH_PARISH_LIFE"
  | "FACILITY_RENTAL"
  | "WEBSITE_ONLINE"
  | "VOLUNTEER_DONATION"
  | "OTHER"

export const EMAIL_DOMAIN_OPTIONS = [
  "gmail.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "nate.com",
  "lycos.com",
  "직접입력",
] as const

export const INQUIRY_TYPE_OPTIONS: ReadonlyArray<{
  value: InquiryType
  label: string
}> = [
  { value: "MASS_SACRAMENT", label: "미사 및 성사 문의" },
  { value: "CATECHUMEN_CLASS", label: "예비신자 / 교리 문의" },
  { value: "FAITH_PARISH_LIFE", label: "신앙 및 본당 생활 문의" },
  { value: "FACILITY_RENTAL", label: "시설 및 대관 문의" },
  { value: "WEBSITE_ONLINE", label: "홈페이지 및 온라인 서비스 문의" },
  { value: "VOLUNTEER_DONATION", label: "봉사 및 후원 문의" },
  { value: "OTHER", label: "기타 문의" },
]

export type InquiryFormValues = {
  inquiryType: InquiryType | ""
  emailLocal: string
  emailDomainOption: (typeof EMAIL_DOMAIN_OPTIONS)[number]
  emailDomainCustom: string
  content: string
}

export const INITIAL_VALUES: InquiryFormValues = {
  inquiryType: "",
  emailLocal: "",
  emailDomainOption: "naver.com",
  emailDomainCustom: "",
  content: "",
}

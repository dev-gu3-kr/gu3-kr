import {
  HomeQuickAboutSvg,
  HomeQuickDirectionsSvg,
  HomeQuickMassSacramentsSvg,
  HomeQuickSalesiansSvg,
  HomeQuickWeeklyBulletinSvg,
  HomeQuickYoutubeSvg,
} from "@/components/svgs"

import type { HomePageViewModel } from "@/features/home/isomorphic"

function createSchedulerItems(year: number, month: number) {
  const lastDate = new Date(year, month, 0).getDate()

  return Array.from({ length: lastDate }, (_, index) => {
    const date = new Date(year, month - 1, index + 1)
    const dateIso = date.toISOString()

    if (index === 2) {
      return {
        dateIso,
        dayLabel: "화",
        dayNumber: 3,
        isActive: true,
        events: ["등록된 스케줄 한 줄"],
      }
    }

    if (index === 3) {
      return {
        dateIso,
        dayLabel: "수",
        dayNumber: 4,
        events: ["등록된 스케줄의 내용", "최대 두줄까지 표시"],
      }
    }

    return {
      dateIso,
      dayLabel: ["일", "월", "화", "수", "목", "금", "토"][date.getDay()],
      dayNumber: index + 1,
      events: [],
    }
  })
}

// Figma의 정보 구조를 먼저 고정해 두고 이후 API 연결 시 같은 모양을 재사용한다.
export const homePageMock: HomePageViewModel = {
  navItems: [
    { label: "구로3동 성당" },
    { label: "본당알림" },
    { label: "본당업무" },
    { label: "공동체 마당" },
    { label: "청소년 마당" },
    { label: "신앙생활" },
  ],
  quickLinks: [
    {
      label: "본당 소개",
      href: "/parish/about",
      icon: HomeQuickAboutSvg,
    },
    {
      label: "주보",
      icon: HomeQuickWeeklyBulletinSvg,
    },
    {
      label: "살레시오회",
      href: "/parish/salesians",
      icon: HomeQuickSalesiansSvg,
    },
    {
      label: "미사와 성사",
      icon: HomeQuickMassSacramentsSvg,
    },
    {
      label: "오시는 길",
      icon: HomeQuickDirectionsSvg,
    },
    {
      label: "유튜브 채널",
      icon: HomeQuickYoutubeSvg,
    },
  ],
  schedulerMonthLabel: "2026년 3월",
  schedulerItems: createSchedulerItems(2026, 3),
  eventCards: [
    {
      title: "성당 공동체 미사",
      description: "전례와 환영의 시간을 담은 행사 스케치",
      accentClassName:
        "from-[#ccb28c] via-[#8c5b34] to-[#3a2419] dark:from-[#6a543e] dark:to-[#24160f]",
    },
    {
      title: "첫영성체 기념",
      description: "축복과 기쁨이 모인 순간",
      accentClassName:
        "from-[#d8d4cf] via-[#8d735b] to-[#463328] dark:from-[#70655c] dark:to-[#2b2018]",
    },
    {
      title: "청년 공동체",
      description: "함께 모여 웃고 기도하는 자리",
      accentClassName:
        "from-[#d7c7c2] via-[#90737a] to-[#3c2c33] dark:from-[#7a6768] dark:to-[#241b20]",
    },
    {
      title: "복사단 나들이",
      description: "밝은 리듬으로 살아 있는 현장 기록",
      accentClassName:
        "from-[#c0c7d8] via-[#6b7ca0] to-[#27324d] dark:from-[#58627d] dark:to-[#171d2e]",
    },
  ],
  boardColumns: [
    {
      title: "공지사항",
      items: [
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
      ],
    },
    {
      title: "청소년 블로그",
      items: [
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
      ],
    },
    {
      title: "본당 주보",
      items: [
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
        {
          title: "제목이 여기에 들어갑니다. 제목이 길 경우 한 줄까...",
          date: "2026/02/26",
        },
      ],
    },
  ],
  shortcutCards: [
    {
      title: "예비신자 교리",
      subtitle: "처음 신앙을 시작하는 분들을 위한 안내",
      accentClassName: "from-[#60443a] via-[#a47b61] to-[#2e1a15]",
      thumbnailUrl: "/images/shortcut-catechumen-class.webp",
    },
    {
      title: "유아세례",
      subtitle: "가정을 위한 축복의 순간",
      accentClassName: "from-[#8b7f74] via-[#d3bfb2] to-[#53433b]",
      thumbnailUrl: "/images/shortcut-infant-baptism.webp",
    },
    {
      title: "혼인성사",
      subtitle: "두 사람의 약속을 위한 준비",
      accentClassName: "from-[#a38a67] via-[#d6be9a] to-[#57442e]",
      thumbnailUrl: "/images/shortcut-marriage.webp",
    },
    {
      title: "병자성사",
      subtitle: "위로와 회복을 위한 기도",
      accentClassName: "from-[#525a65] via-[#94a1b2] to-[#242831]",
      thumbnailUrl: "/images/shortcut-anointing.webp",
    },
    {
      title: "선종안내",
      subtitle: "장례 절차와 본당 지원 안내",
      accentClassName: "from-[#6c5f55] via-[#a8927e] to-[#31261f]",
      thumbnailUrl: "/images/funeral-guide-bg.webp",
    },
    {
      title: "사무실안내",
      subtitle: "운영 시간과 연락처를 확인하세요",
      accentClassName: "from-[#5977c6] via-[#8da3dd] to-[#233968]",
      thumbnailUrl: "/images/office-guide-bg.webp",
    },
  ],
  massTimes: [
    {
      title: "주일 미사",
      lines: [
        "오전 6시 30분 (새벽), 오전 10시 30분 (교중)",
        "오후 12시 (중고등부), 오후 3시 (유초등부)",
        "오후 6시 (청년부), 오후 9시 (밤), 토요일: 오후 7시 (토요주일)",
      ],
    },
    {
      title: "평일 미사",
      lines: [
        "월/화/수/금요일 : 오전 6시 30분, 오후 7시",
        "목요일 : 오전 6시 30분, 오전 10시, 오후 7시",
        "토요일 : 오전 6시 30분",
      ],
    },
  ],
}

export interface Badge {
  id: string;
  image: string;
  description: string;
  tooltipTitle: string;
  tooltipSubtitle: string;
  unlocked?: boolean;
  current?: number;
  target?: number;
  period?: 'day' | 'week' | 'month';  // Add this line
  rank?: string;  // Add this line too
  progress?: number;
}

// Pre-defined achievements with their badges
export const ACHIEVEMENTS = {
  streak: [
    {
      id: 'streak_5',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-HWOAO1EUTGSglSzZlSFjHA-dQjZimptRd-0SpN_-6oU5w-removebg-preview_iatnoy.png',
      description: '5 Day Streak',
      tooltipTitle: '5 Day Streak',
      tooltipSubtitle: 'Practice for 5 consecutive days',
      target: 5
    },
    {
      id: 'streak_10',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-3d-render-of-a-chunky-cartoon-calendar-icon-with-QHfb4ipTQUu1iR54Vmxo6g-RFBtanJsS0aS2a2tOFHHXg-removebg-preview_kzjyge.png',
      description: '10 Day Streak',
      tooltipTitle: '10 Day Streak',
      tooltipSubtitle: 'Practice for 10 consecutive days',
      target: 10
    },
    {
      id: 'streak_30',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-CSU-cRrnTDCAuvGYTSV90w-taY5gPBoQxydiszFPNpDvQ-removebg-preview_hnqjkl.png',
      description: '30 Day Streak',
      tooltipTitle: '30 Day Streak',
      tooltipSubtitle: 'Practice for 30 consecutive days',
      target: 30
    },
    {
      id: 'streak_90',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-RCaF4tpKT7aJoICZ2L508Q-UCW5RDP4Q4KfvoRnq8NlfA-removebg-preview_tevelw.png',
      description: '90 Day Streak',
      tooltipTitle: '90 Day Streak',
      tooltipSubtitle: 'Practice for 90 consecutive days',
      target: 90
    },
    {
      id: 'streak_180',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-L5aDOKYDTgKsB2lxHimuQQ-2xr3cxz6RCeNCL9HhBtylA-removebg-preview_oooy2m.png',
      description: '180 Day Streak',
      tooltipTitle: '180 Day Streak',
      tooltipSubtitle: 'Practice for 180 consecutive days',
      target: 180
    },
    {
      id: 'streak_365',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/a-pixar-style-3d-render-of-a-cartoon-calendar-icon-9Ut5P-Z7Q-qcpgWOIlslCA-YQ3T7zHwThCVVysgv9KyEg-removebg-preview_dlplgi.png',
      description: '365 Day Streak',
      tooltipTitle: '365 Day Streak',
      tooltipSubtitle: 'Practice for 365 consecutive days',
      target: 365
    }
  ],
  calls: [
    {
      id: 'calls_10',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206170/WhatsApp_Image_2024-11-07_at_23.19.01_2cecae84-removebg-preview_radody.png',
      description: '10 Calls',
      tooltipTitle: '10 Calls',
      tooltipSubtitle: 'Complete 10 calls',
      target: 10
    },
    {
      id: 'calls_25',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.19.00_410bcd52-removebg-preview_bi6eon.png',
      description: '25 Calls',
      tooltipTitle: '25 Calls',
      tooltipSubtitle: 'Complete 25 calls',
      target: 25
    },
    {
      id: 'calls_50',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206170/WhatsApp_Image_2024-11-07_at_23.19.00_e9686083-removebg-preview_qt9tyx.png',
      description: '50 Calls',
      tooltipTitle: '50 Calls',
      tooltipSubtitle: 'Complete 50 calls',
      target: 50
    },
    {
      id: 'calls_100',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.59_aaafd20b-removebg-preview_mniysw.png',
      description: '100 Calls',
      tooltipTitle: '100 Calls',
      tooltipSubtitle: 'Complete 100 calls',
      target: 100
    },
    {
      id: 'calls_250',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.58_e34cbb5f-removebg-preview_nm6c8a.png',
      description: '250 Calls',
      tooltipTitle: '250 Calls',
      tooltipSubtitle: 'Complete 250 calls',
      target: 250
    },
    {
      id: 'calls_500',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206170/WhatsApp_Image_2024-11-07_at_23.18.59_dac37adb-removebg-preview_xfpwp9.png',
      description: '500 Calls',
      tooltipTitle: '500 Calls',
      tooltipSubtitle: 'Complete 500 calls',
      target: 500
    },
    {
      id: 'calls_750',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.57_f7535a53-removebg-preview_we2xbp.png',
      description: '750 Calls',
      tooltipTitle: '750 Calls',
      tooltipSubtitle: 'Complete 750 calls',
      target: 750
    },
    {
      id: 'calls_1000',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/WhatsApp_Image_2024-11-07_at_23.18.57_717b1f9c-removebg-preview_yupyox.png',
      description: '1000 Calls',
      tooltipTitle: '1000 Calls',
      tooltipSubtitle: 'Complete 1000 calls',
      target: 1000
    },
    {
      id: 'calls_1500',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.18.58_44ffd513-removebg-preview_jsmszk.png',
      description: '1500 Calls',
      tooltipTitle: '1500 Calls',
      tooltipSubtitle: 'Complete 1500 calls',
      target: 1500
    },
    {
      id: 'calls_2500',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/WhatsApp_Image_2024-11-07_at_23.19.01_b4416b2f-removebg-preview_jd6136.png',
      description: '2500 Calls',
      tooltipTitle: '2500 Calls',
      tooltipSubtitle: 'Complete 2500 calls',
      target: 2500
    }
  ],
  activity: [
    {
      id: 'daily_10',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206168/InBodPWuQrymOXROYwUwow-removebg-preview_b9fn8n.png',
      description: '10 Sessions in a Day',
      tooltipTitle: '10 Sessions in a Day',
      tooltipSubtitle: 'Complete 10 sessions in one day',
      target: 10,
      period: 'day'
    },
    {
      id: 'weekly_50',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/DuZdTwN_T8SRiCdUHDt-AQ-removebg-preview_1_jcg1nm.png',
      description: '50 Sessions in a Week',
      tooltipTitle: '50 Sessions in a Week',
      tooltipSubtitle: 'Complete 50 sessions in one week',
      target: 50,
      period: 'week'
    },
    {
      id: 'monthly_100',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1731206169/73z7d5wLQiyhufwfTdw5OA-removebg-preview_1_ktrxif.png',
      description: '100 Sessions in a Month',
      tooltipTitle: '100 Sessions in a Month',
      tooltipSubtitle: 'Complete 100 sessions in one month',
      target: 100,
      period: 'month'
    }
  ],
  league: [
    {
      id: 'league_first',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732605321/a-3d-render-of-a-large-radiant-gold-medal-with-a-b-T5VpM4deRuWtnNpknWeXKA-oVpwYeqBTOuOBOCRRskHXg-removebg-preview_qzif0n.png',
      description: 'League Champion',
      tooltipTitle: 'League Champion',
      tooltipSubtitle: 'Finish first in weekly league',
    },
    {
      id: 'league_second',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732605321/a-3d-render-of-a-large-radiant-silver-medal-with-a-SF8CEVMrSWaKtCH-SS0KPw-xITb8y53Tw-95YbTOpEHoQ-removebg-preview_g0hbaj.png',
      description: 'League Runner-up',
      tooltipTitle: 'League Runner-up',
      tooltipSubtitle: 'Finish second in weekly league',
    },
    {
      id: 'league_third',
      image: 'https://res.cloudinary.com/dmbzcxhjn/image/upload/v1732605321/a-3d-render-of-a-large-radiant-bronze-medal-with-a-t0r6ItMuRVOEve22GfVYdw-KxQg20b_SdOR5Y3HVUaVZg-removebg-preview_p9tfee.png',
      description: 'League Top 3',
      tooltipTitle: 'League Top 3',
      tooltipSubtitle: 'Finish third in weekly league',
    }
  ]
};

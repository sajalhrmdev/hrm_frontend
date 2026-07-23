"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const HolidayCalendarsComponent = dynamic(
  () => import("@/components/hrm/attendance/holiday-calendar/holidayCalendar"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);
const HolidayCalendarClient = () => {
  return (
    <><HolidayCalendarsComponent/></>
  )
}

export default HolidayCalendarClient
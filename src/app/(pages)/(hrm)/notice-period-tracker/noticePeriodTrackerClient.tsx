"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const NoticePeriodTrackerComponent = dynamic(
  () => import("@/components/hrm/notice-period-tracker/noticePeriodTracker"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);

const NoticePeriodTrackerClient = () => {
  return (
    <><NoticePeriodTrackerComponent/></>
  )
}

export default NoticePeriodTrackerClient
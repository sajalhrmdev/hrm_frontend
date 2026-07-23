"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const LearningAnalyticsComponent = dynamic(
  () => import("@/components/training/learning-analytics/learningAnalytics"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);
const LearningAnalyticsClient = () => {
  return (
    <><LearningAnalyticsComponent/></>
  )
}

export default LearningAnalyticsClient
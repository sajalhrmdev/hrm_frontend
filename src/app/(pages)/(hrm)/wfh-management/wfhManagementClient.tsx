"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const WorkFromHomeComponent = dynamic(
  () => import("@/components/hrm/attendance/work-from-home/workFromHome"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);

const WfhManagementClient = () => {
  return (
    <><WorkFromHomeComponent/></>
  )
}

export default WfhManagementClient
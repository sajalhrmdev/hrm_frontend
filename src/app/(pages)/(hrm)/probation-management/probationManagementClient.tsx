"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const ProbationManagementComponent = dynamic(
  () => import("@/components/hrm/probation-management/probationManagement"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);
const ProbationManagementClient = () => {
  return (
    <><ProbationManagementComponent/></>
  )
}

export default ProbationManagementClient
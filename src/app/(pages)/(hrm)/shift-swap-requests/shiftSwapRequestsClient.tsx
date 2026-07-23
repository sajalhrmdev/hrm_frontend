"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const ShiftSwapRequestsComponent = dynamic(
  () => import("@/components/hrm/attendance/shift-swap-requests/shiftSwapRequests"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);

const ShiftSwapRequestsClient = () => {
  return (
    <><ShiftSwapRequestsComponent/></>
  )
}

export default ShiftSwapRequestsClient
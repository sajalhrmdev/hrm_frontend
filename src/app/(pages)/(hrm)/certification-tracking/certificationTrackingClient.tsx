"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const CertificationTrackingComponent = dynamic(
  () => import("@/components/training/certification-tracking/certificationTracking"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);
const CertificationTrackingClient = () => {
  return (
    <><CertificationTrackingComponent/></>
  )
}

export default CertificationTrackingClient
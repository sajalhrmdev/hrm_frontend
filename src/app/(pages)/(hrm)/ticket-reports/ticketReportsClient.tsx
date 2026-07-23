"use client";

import dynamic from "next/dynamic";
import { SkeletonPage } from "@/core/common/Skeleton";

const TicketReportsComponent = dynamic(
  () => import("@/components/hrm/ticket-reports/ticketReports"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);

const TicketReportsClient = () => {
  return (
    <><TicketReportsComponent/></>
  )
}

export default TicketReportsClient
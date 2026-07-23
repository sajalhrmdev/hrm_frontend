"use client";
import dynamic from 'next/dynamic';
import { SkeletonPage } from "@/core/common/Skeleton";
const TicketAutomationComponent = dynamic(
  () => import("@/components/hrm/ticket-automation/ticketAutomation"),
  {
    ssr: false,
    loading: () => <SkeletonPage />,
  },
);
const TicketAutomationClient = () => {
  return (
    <><TicketAutomationComponent/></>
  )
}

export default TicketAutomationClient
"use client";

import dynamic from "next/dynamic";

const MobileThemesComponent = dynamic(
    () => import("@/components/super-admin/mobile-themes"),
    { ssr: false }
);

const MobileThemesClient = () => {
    return <MobileThemesComponent />;
};

export default MobileThemesClient;

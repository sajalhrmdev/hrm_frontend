"use client";

import dynamic from "next/dynamic";

const BordersComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/borders"),
    { ssr: false }
);

const BorderClient = () => {
    return <BordersComponent />;
};

export default BorderClient;


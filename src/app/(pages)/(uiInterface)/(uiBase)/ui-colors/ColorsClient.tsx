"use client";

import dynamic from "next/dynamic";

const ColorsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/colors"),
    { ssr: false }
);

const ColorsClient = () => {
    return <ColorsComponent />;
};

export default ColorsClient;


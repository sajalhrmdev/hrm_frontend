"use client";

import dynamic from "next/dynamic";

const HelpArticlesComponent = dynamic(
    () => import("@/components/super-admin/help-articles"),
    { ssr: false }
);

const HelpArticlesClient = () => {
    return <HelpArticlesComponent />;
};

export default HelpArticlesClient;

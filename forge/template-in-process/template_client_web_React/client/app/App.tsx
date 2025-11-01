import React, { useEffect, useState, Suspense, lazy } from "react";
import { StyleSheet, View } from "react-native";
import { BrowserRouter } from "react-router-dom";

import { SuperProvider } from "@client/core/services/providers/superProviderService";
import { useSystemData } from "@client/core/services/providers/systemDataProviderService";
import { useLanguage } from "@client/core/services/providers/languageProviderService";
import { useStyleContext } from "@client/core/services/providers/styleProvider";


import type { ViewStyle } from "react-native";


const gstyles: { [key: string]: ViewStyle } = {
    name: {
        display: 'flex'
    }
};
const languages = {
    "en-US": {}
};



export default function App({ 
    Component
}: { Component?: React.LazyExoticComponent<React.FC> }) {
    const { setSysValue, setSysValues } = useSystemData();
    const { setLanguagePack } = useLanguage();
    const { addGroup } = useStyleContext();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        addGroup(StyleSheet.create(gstyles));
        setLanguagePack(languages["en-US"]);
        setSysValues(initSysValues());
        //setSysValue("config", Config);
        setReady(true);
    }, []);

    if (!ready) return <Loading />;

    return (
        <SuperProvider>
            <BrowserRouter>
                {Component ? <Component /> : <Loading />}
            </BrowserRouter>
        </SuperProvider>
    );
}

function initSysValues() {
    return {
    }
}

function Loading() {
    return <View>Loading...</View>;
}

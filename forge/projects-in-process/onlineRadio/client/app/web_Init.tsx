import React, { useEffect, useState, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { StyleSheet, View, Text } from "react-native";
import { BrowserRouter } from "react-router-dom";

import { SuperProvider } from "@client/core/services/providers/superProviderService";
import { useSystemData } from "@client/core/services/providers/systemDataProviderService";
import { useLanguage } from "@client/core/services/providers/languageProviderService";
import { useStyleContext } from "@client/core/services/providers/styleProvider";
import { RootNavigator } from "./web_Navigation";

import appRoot from "../modules/routes";


import type { ViewStyle } from "react-native";


const gstyles: Record<string, ViewStyle> = {
    name: {
        display: 'flex'
    },
};
const languages = {
    "en-US": {}
};

export function InitWebRoot(): ReactDOM.Root {
    let appNode = document.getElementById("app");
    if (!appNode) {
        appNode = document.createElement('div');
        appNode.id = 'app';
        document.body.appendChild(appNode);
    }
    document.title = 'App';	

    appNode.style.display = 'flex';
    appNode.style.minHeight = '100vh';
    appNode.style.maxHeight = '100vh';
    appNode.style.minWidth = '100vw';
    appNode.style.fontSize = '1rem';
    //appNode.style.fontFamily = style.main.fontFamily;
    appNode.style.backgroundColor = '#fff';
    
    return ReactDOM.createRoot(appNode);
}

export function AppWeb() {
    return (
        <SuperProvider>
            <AppInit />
        </SuperProvider>
    );
}

function AppInit() {
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

    if (!ready) return <PlaceholderScreen name={"Loading..."} />;

    return (
        <BrowserRouter>
            <RootNavigator rootNode={appRoot}/>
        </BrowserRouter>
    );
}

function initSysValues() {
    return {
    }
}

function PlaceholderScreen({ 
    name, 
    style 
}: { 
    name: string, 
    style?: ViewStyle 
}) {
    return (
        <View style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            ...style
        }}>
            <Text>{name}</Text>
        </View>
    )
};
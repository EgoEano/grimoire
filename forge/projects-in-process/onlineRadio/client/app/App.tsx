import React from "react";
import {AppWeb, InitWebRoot} from "./web_Init";

type InitArgs = 'mobile' | 'web';

export default function init(platform: InitArgs) {
    switch (platform) {
        case 'mobile':
            //AppRegistry.registerComponent(appName, () => App);
            break;
        case 'web':
            const root = InitWebRoot();
            root.render(<AppWeb/>);
            break;
        default:
            throw new Error("Argument 'platform' is neccessary!")
    }
}

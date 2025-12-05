import React from 'react';
import { AppWeb, InitWebRoot } from './web_Init';

export default function initWebApp() {
    const root = InitWebRoot();
    root.render(<AppWeb/>);
}
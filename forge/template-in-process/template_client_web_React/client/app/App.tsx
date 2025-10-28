// import React, { useEffect, useState, Suspense, lazy } from "react";
// import { BrowserRouter } from "react-router-dom";
// import { SuperProvider } from "./context/SuperProvider";
// import { useSystemData } from "./hooks/useSystemData";
// import { useLanguage } from "./hooks/useLanguage";
// import { useStyleContext } from "./hooks/useStyleContext";

// export default function App({ component }: { component?: React.LazyExoticComponent<React.FC> }) {
//   const { setSysValue, setSysValues } = useSystemData();
//   const { setLanguagePack } = useLanguage();
//   const { addGroup } = useStyleContext();
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     addGroup(globalStyles);
//     setLanguagePack(languages["en-US"]);
//     setSysValues(initSysValues());
//     setSysValue("config", Config);
//     setReady(true);
//   }, []);

//   if (!ready) return <div>Loading...</div>;

//   const Component = component ?? lazy(() => import("./AppRouter"));

//   return (
//     <SuperProvider>
//       <BrowserRouter>
//         <Suspense fallback={<div>Loading module...</div>}>
//           <Component />
//         </Suspense>
//       </BrowserRouter>
//     </SuperProvider>
//   );
// }

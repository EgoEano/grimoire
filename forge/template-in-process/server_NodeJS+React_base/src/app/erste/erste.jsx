import ReactDOM from "react-dom/client";
import * as React from "react";
import ReactRouterDOM, { BrowserRouter, Routes, Route, Link, Outlet, useParams, useSearchParams } from "react-router-dom";
import "@styles/tailwind.css";
import * as Cmp from "@app/erste/components/components.jsx";

const appNode = document.querySelector("#app_erste");
appNode.classList.add("flex", "min-h-screen", "w-screen");
window.root = ReactDOM.createRoot(appNode);

function App(p) {
	return (
		<Main />
	);
}

function Main(p) {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Cmp.AppBase />} />
				<Route path="/erste" element={<Cmp.AppBase />} />
				<Route path="*" element={<Cmp.NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

window.root.render(<App />);
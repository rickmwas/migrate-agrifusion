import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import ListingDetail from "./pages/ListingDetail";
import AddListing from "./pages/AddListing";
import AgriBot from "./pages/AgriBot";
import QualityChecking from "./pages/QualityChecking";
import MarketAdvisor from "./pages/MarketAdvisor";
import WeatherAnalysis from "./pages/WeatherAnalysis";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/marketplace",
      element: <Marketplace />,
    },
    {
      path: "/listing/:id",
      element: <ListingDetail />,
    },
    {
      path: "/add-listing",
      element: <AddListing />,
    },
    {
      path: "/agri-bot",
      element: <AgriBot />,
    },
    {
      path: "/quality-checking",
      element: <QualityChecking />,
    },
    {
      path: "/market-advisor",
      element: <MarketAdvisor />,
    },
    {
      path: "/weather-analysis",
      element: <WeatherAnalysis />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);
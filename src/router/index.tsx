import { createBrowserRouter } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";

import Home from "../pages/Home";
import Demos from "../pages/Demos";
import Contact from "../pages/Contact";
import Reviews from "../pages/Reviews";
import Admin from "../pages/Admin";
import NotFound from "../pages/NotFound";
import LandscapingDemo from "../pages/demo-pages/LandscapingDemo";
import PlumbingDemo from "../pages/demo-pages/PlumbingDemo";
import HvacDemo from "../pages/demo-pages/HvacDemo";
import ElectricianDemo from "../pages/demo-pages/ElectricianDemo";
import RoofingDemo from "../pages/demo-pages/RoofingDemo";
import CleaningServicesDemo from "../pages/demo-pages/CleaningServicesDemo";
import PressureWashingDemo from "../pages/demo-pages/PressureWashingDemo";
import AutoDetailingDemo from "../pages/demo-pages/AutoDetailingDemo";
import RestaurantsDemo from "../pages/demo-pages/RestaurantsDemo";
import CafeDemo from "../pages/demo-pages/CafeDemo";
import BarbershopDemo from "../pages/demo-pages/BarbershopDemo";
import SalonDemo from "../pages/demo-pages/SalonDemo";
import FitnessDemo from "../pages/demo-pages/FitnessDemo";
import RealEstateDemo from "../pages/demo-pages/RealEstateDemo";
import PhotographyDemo from "../pages/demo-pages/PhotographyDemo";
import DentalMedicalDemo from "../pages/demo-pages/DentalMedicalDemo";
import LawFirmDemo from "../pages/demo-pages/LawFirmDemo";
import ConstructionDemo from "../pages/demo-pages/ConstructionDemo";
import MovingCompanyDemo from "../pages/demo-pages/MovingCompanyDemo";
import HomeRemodelingDemo from "../pages/demo-pages/HomeRemodelingDemo";

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/demos", element: <Demos /> },
      { path: "/contact", element: <Contact /> },
      { path: "/demos/landscaping", element: <LandscapingDemo /> },
      { path: "/demos/plumbing", element: <PlumbingDemo /> },
      { path: "/demos/hvac", element: <HvacDemo /> },
      { path: "/demos/electrician", element: <ElectricianDemo /> },
      { path: "/demos/roofing", element: <RoofingDemo /> },
      { path: "/demos/cleaning-services", element: <CleaningServicesDemo /> },
      { path: "/demos/pressure-washing", element: <PressureWashingDemo /> },
      { path: "/demos/auto-detailing", element: <AutoDetailingDemo /> },
      { path: "/demos/restaurants", element: <RestaurantsDemo /> },
      { path: "/demos/cafe", element: <CafeDemo /> },
      { path: "/demos/barbershops", element: <BarbershopDemo /> },
      { path: "/demos/salons", element: <SalonDemo /> },
      { path: "/demos/fitness-personal-training", element: <FitnessDemo /> },
      { path: "/demos/real-estate", element: <RealEstateDemo /> },
      { path: "/demos/photography", element: <PhotographyDemo /> },
      { path: "/demos/dental-medical", element: <DentalMedicalDemo /> },
      { path: "/demos/law-firm", element: <LawFirmDemo /> },
      { path: "/demos/construction", element: <ConstructionDemo /> },
      { path: "/demos/moving-company", element: <MovingCompanyDemo /> },
      { path: "/demos/home-remodeling", element: <HomeRemodelingDemo /> },
      { path: "/reviews", element: <Reviews /> },
      { path: "/admin", element: <Admin /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
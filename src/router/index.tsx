import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";

const Home = lazy(() => import("../pages/Home"));
const Demos = lazy(() => import("../pages/Demos"));
const Contact = lazy(() => import("../pages/Contact"));
const Reviews = lazy(() => import("../pages/Reviews"));
const Admin = lazy(() => import("../pages/Admin"));
const NotFound = lazy(() => import("../pages/NotFound"));
const LandscapingDemo = lazy(() => import("../pages/demo-pages/LandscapingDemo"));
const PlumbingDemo = lazy(() => import("../pages/demo-pages/PlumbingDemo"));
const HvacDemo = lazy(() => import("../pages/demo-pages/HvacDemo"));
const ElectricianDemo = lazy(() => import("../pages/demo-pages/ElectricianDemo"));
const RoofingDemo = lazy(() => import("../pages/demo-pages/RoofingDemo"));
const CleaningServicesDemo = lazy(() => import("../pages/demo-pages/CleaningServicesDemo"));
const PressureWashingDemo = lazy(() => import("../pages/demo-pages/PressureWashingDemo"));
const AutoDetailingDemo = lazy(() => import("../pages/demo-pages/AutoDetailingDemo"));
const RestaurantsDemo = lazy(() => import("../pages/demo-pages/RestaurantsDemo"));
const CafeDemo = lazy(() => import("../pages/demo-pages/CafeDemo"));
const BarbershopDemo = lazy(() => import("../pages/demo-pages/BarbershopDemo"));
const SalonDemo = lazy(() => import("../pages/demo-pages/SalonDemo"));
const FitnessDemo = lazy(() => import("../pages/demo-pages/FitnessDemo"));
const RealEstateDemo = lazy(() => import("../pages/demo-pages/RealEstateDemo"));
const PhotographyDemo = lazy(() => import("../pages/demo-pages/PhotographyDemo"));
const DentalMedicalDemo = lazy(() => import("../pages/demo-pages/DentalMedicalDemo"));
const LawFirmDemo = lazy(() => import("../pages/demo-pages/LawFirmDemo"));
const ConstructionDemo = lazy(() => import("../pages/demo-pages/ConstructionDemo"));
const MovingCompanyDemo = lazy(() => import("../pages/demo-pages/MovingCompanyDemo"));
const HomeRemodelingDemo = lazy(() => import("../pages/demo-pages/HomeRemodelingDemo"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Success = lazy(() => import("../pages/Success"));
const Failure = lazy(() => import("../pages/Failure"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const OutreachUnsubscribe = lazy(() => import("../pages/OutreachUnsubscribe"));

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
      {
        path: "/demos/cafe",
        element: <CafeDemo canonicalPath="/demos/cafes-coffee-shops" />,
      },
      { path: "/demos/cafes-coffee-shops", element: <CafeDemo /> },
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
      { path: "/pricing", element: <Pricing /> },
      { path: "/reviews", element: <Reviews /> },
      { path: "/terms", element: <TermsOfService /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/unsubscribe", element: <OutreachUnsubscribe /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "/success", element: <Success /> },
  { path: "/failure", element: <Failure /> },
  { path: "/admin", element: <Admin /> },
]);

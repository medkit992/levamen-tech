import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { barbershopDemoData } from "../../demos/barbershopDemo";

export default function BarbershopDemo() {
  return <DemoPageTemplate {...barbershopDemoData} />;
}
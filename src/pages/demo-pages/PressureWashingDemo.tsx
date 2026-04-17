import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { pressureWashingDemoData } from "../../demos/pressureWashingDemo";

export default function PressureWashingDemo() {
  return <DemoPageTemplate {...pressureWashingDemoData} />;
}
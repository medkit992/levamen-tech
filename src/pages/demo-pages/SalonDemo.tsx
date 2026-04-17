import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { salonDemoData } from "../../demos/salonDemo";

export default function SalonDemo() {
  return <DemoPageTemplate {...salonDemoData} />;
}
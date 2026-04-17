import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { realEstateDemoData } from "../../demos/realEstateDemo";

export default function RealEstateDemo() {
  return <DemoPageTemplate {...realEstateDemoData} />;
}
import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { electricianDemoData } from "../../demos/electricianDemo";

export default function ElectricianDemo() {
  return <DemoPageTemplate {...electricianDemoData} />;
}
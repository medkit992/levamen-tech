import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { hvacDemoData } from "../../demos/hvacDemo";

export default function HvacDemo() {
  return <DemoPageTemplate {...hvacDemoData} />;
}
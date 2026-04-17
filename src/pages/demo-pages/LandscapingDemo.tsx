import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { landscapingDemoData } from "../../demos/landscapingDemo";

export default function LandscapingDemo() {
  return <DemoPageTemplate {...landscapingDemoData} />;
}
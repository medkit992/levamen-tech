import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { lawFirmDemoData } from "../../demos/lawFirmDemo";

export default function LawFirmDemo() {
  return <DemoPageTemplate {...lawFirmDemoData} />;
}
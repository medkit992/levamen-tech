import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { plumbingDemoData } from "../../demos/plumbingDemo";

export default function PlumbingDemo() {
  return <DemoPageTemplate {...plumbingDemoData} />;
}
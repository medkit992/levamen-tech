import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { cafeDemoData } from "../../demos/cafeDemo";

export default function CafeDemo() {
  return <DemoPageTemplate {...cafeDemoData} />;
}
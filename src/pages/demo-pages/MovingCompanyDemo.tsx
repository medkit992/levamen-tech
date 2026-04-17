import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { movingCompanyDemoData } from "../../demos/movingCompanyDemo";

export default function MovingCompanyDemo() {
  return <DemoPageTemplate {...movingCompanyDemoData} />;
}
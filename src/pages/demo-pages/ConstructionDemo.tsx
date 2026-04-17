import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { constructionDemoData } from "../../demos/constructionDemo";

export default function ConstructionDemo() {
  return <DemoPageTemplate {...constructionDemoData} />;
}
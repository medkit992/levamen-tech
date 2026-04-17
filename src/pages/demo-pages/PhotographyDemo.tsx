import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { photographyDemoData } from "../../demos/photographyDemo";

export default function PhotographyDemo() {
  return <DemoPageTemplate {...photographyDemoData} />;
}
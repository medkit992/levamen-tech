import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { cafeDemoData } from "../../demos/cafeDemo";

type CafeDemoProps = {
  canonicalPath?: string;
};

export default function CafeDemo({ canonicalPath }: CafeDemoProps) {
  return <DemoPageTemplate {...cafeDemoData} canonicalPath={canonicalPath} />;
}

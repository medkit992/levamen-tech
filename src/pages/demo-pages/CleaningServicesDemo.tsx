import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { cleaningServicesDemoData } from "../../demos/cleaningServicesDemo";

export default function CleaningServicesDemo() {
  return <DemoPageTemplate {...cleaningServicesDemoData} />;
}
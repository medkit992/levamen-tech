import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { dentalMedicalDemoData } from "../../demos/dentalMedicalDemo";

export default function DentalMedicalDemo() {
  return <DemoPageTemplate {...dentalMedicalDemoData} />;
}
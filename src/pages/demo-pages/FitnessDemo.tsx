import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { fitnessDemoData } from "../../demos/fitnessDemo";

export default function FitnessDemo() {
  return <DemoPageTemplate {...fitnessDemoData} />;
}
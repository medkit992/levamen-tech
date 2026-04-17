import DemoPageTemplate from "../../components/demos/DemoPageTemplate";
import { restaurantsDemoData } from "../../demos/restaurantsDemo";

export default function RestaurantsDemo() {
  return <DemoPageTemplate {...restaurantsDemoData} />;
}
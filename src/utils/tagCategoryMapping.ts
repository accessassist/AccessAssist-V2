import { AccessTag } from "../types";
import { Colors } from "../constants/colors";

// This is a mapping of tag names to their categories
// This should be populated from the database in a real application
export const tagCategoryMapping: Record<
  string,
  "physical" | "sensory" | "cognitive"
> = {
  // Physical tags (1)
  "Accessible Door Width": "physical",
  "Accessible Parking": "physical",
  "Accessible Seating": "physical",
  "Accessible Stalls": "physical",
  "Accessible Washroom": "physical",
  "Alternative Entrance": "physical",
  "Automatic Door Physical": "physical",
  "Barrier Free Entrance": "physical",
  "Changing Tables": "physical",
  "Covered Entrance": "physical",
  "Covered Parking": "physical",
  "Curb Ramp": "physical",
  "Designated Aisle Seating": "physical",
  "Electric Vehicle Parking": "physical",
  Elevator: "physical",
  "Frequent Seating / Rest points": "physical",
  "Garage Parking": "physical",
  "Gender Neutral Washroom": "physical",
  "Handicap Accessible Door": "physical",
  Handrails: "physical",
  "Lowered Changing Tables": "physical",
  "Lowered Counters": "physical",
  "Lowered Sinks": "physical",
  "Motion Sensor Lighting Physical": "physical",
  "Outdoor Access Only": "physical",
  Ramp: "physical",
  "Service Animal Friendly": "physical",
  "Single Use Washroom": "physical",
  Spacious: "physical",
  "Valet Parking": "physical",
  "Well lit parking": "physical",
  "Well-Lit Path to Entrance": "physical",
  "Wheelchair Accessible Door": "physical",
  "Wheelchair Accessible Phone": "physical",
  "Wheelchair Ramp": "physical",
  "Wide hallway": "physical",
  "WiFi Access": "physical",

  // Sensory tags (2)
  "Adjustable Lighting": "sensory",
  "Audio Guidance": "sensory",
  "Auditory Signals": "sensory",
  "Braille keyboard": "sensory",
  "Braille Menu": "sensory",
  "Braille signs": "sensory",
  "Hearing Loop": "sensory",
  "High-Contrast Signage": "sensory",
  "Large Print": "sensory",
  "Lighting - Bright": "sensory",
  "Lighting - Dim": "sensory",
  Quiet: "sensory",
  "Scent Free": "sensory",
  "Screen Reader": "sensory",
  "Sensory Friendly": "sensory",
  "Sensory Room": "sensory",
  "Shaded Areas": "sensory",
  "Sign language": "sensory",
  "Tactile Pavement": "sensory",
  "Tactile Signs": "sensory",
  "Tactile Surfaces": "sensory",
  "Textured/Visual Wayfinding": "sensory",
  "Visual Alerts": "sensory",

  // Cognitive tags (3)
  "Assistive Technology": "cognitive",
  "Clear Signage": "cognitive",
  "Easy To Read Signs": "cognitive",
  "Extended Service Hours": "cognitive",
  "Flexible Hours": "cognitive",
  "Low Distraction Zones": "cognitive",
  "Low Stimulation Zones": "cognitive",
  "Memory Support": "cognitive",
  "Non/Low-Glare Lighting": "cognitive",
  "Picture Menus": "cognitive",
  "Quiet Areas": "cognitive",
  "Simple Instructions": "cognitive",
  "Simplified Payment Options": "cognitive",
  "Step-By-Step Guidance": "cognitive",
  "Visual Support": "cognitive",
  "Visual and Auditory Landmarks": "cognitive",
  "Visual Schedules": "cognitive",
  "Back Support Seating": "cognitive",
  "Accesible Washroom": "cognitive",
  "Automatic Door Cognitive": "cognitive",
  "Frequent Seating / Rest Points": "cognitive",
  "Motion Sensor Lighting Cognitive": "cognitive",
};

// Helper function to get the category of a tag
export const getTagCategory = (
  tagName: string
): "physical" | "sensory" | "cognitive" | undefined => {
  return tagCategoryMapping[tagName];
};

// Helper function to get the color for a tag based on its category
export const getTagColor = (tagName: string): string => {
  const category = getTagCategory(tagName);
  if (!category) return Colors.text.secondary; // Default color

  switch (category) {
    case "physical":
      return Colors.categories.physical.main;
    case "sensory":
      return Colors.categories.sensory.main;
    case "cognitive":
      return Colors.categories.cognitive.main;
    default:
      return Colors.text.secondary; // Default color
  }
};

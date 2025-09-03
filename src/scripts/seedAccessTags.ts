/*
  Seeding access tags provides a general listing for every single accessibility tag 
  contained within the access assist library. There is also the ability to add new access
  tags at the very bottom. Every item here contains the tag name, description, icon, and the
  category that the tag belongs to (Physical, Sensory, Cognitive).
 */

const { addAccessTag } = require("../api/firestoreService");
const { AccessTag } = require("../types");

const accessTags: Array<Omit<typeof AccessTag, "id">> = [
  // Physical Accessibility Tags
  {
    name: "Accessible Door Width",
    description:
      "Doorways wide enough to accommodate wheelchairs and mobility devices",
    category: "physical",
    icon: "door",
  },
  {
    name: "Accessible Parking",
    description: "Designated parking spaces for people with disabilities",
    category: "physical",
    icon: "car",
  },
  {
    name: "Accessible Seating",
    description:
      "Seating options designed for wheelchair users and people with mobility needs",
    category: "physical",
    icon: "chair",
  },
  {
    name: "Accessible Stalls",
    description: "Wheelchair-accessible bathroom stalls",
    category: "physical",
    icon: "toilet",
  },
  {
    name: "Accessible Washroom",
    description:
      "Bathroom facilities designed for wheelchair users and people with mobility needs",
    category: "physical",
    icon: "bathroom",
  },
  {
    name: "Alternative Entrance",
    description: "An accessible alternative to the main entrance",
    category: "physical",
    icon: "door",
  },
  {
    name: "Automatic Door",
    description: "Doors that open automatically with motion sensors or buttons",
    category: "physical",
    icon: "door",
  },
  {
    name: "Barrier Free Entrance",
    description: "Entrance without steps or barriers",
    category: "physical",
    icon: "door",
  },
  {
    name: "Changing Tables",
    description: "Adult-sized changing tables for people with disabilities",
    category: "physical",
    icon: "table",
  },
  {
    name: "Covered Entrance",
    description: "Entrance with overhead protection from weather",
    category: "physical",
    icon: "umbrella",
  },
  {
    name: "Covered Parking",
    description: "Parking area with overhead protection from weather",
    category: "physical",
    icon: "car",
  },
  {
    name: "Curb Ramp",
    description: "Ramp connecting sidewalk to street level",
    category: "physical",
    icon: "ramp",
  },
  {
    name: "Designated Aisle Seating",
    description: "Seats with extra legroom or space for mobility devices",
    category: "physical",
    icon: "chair",
  },
  {
    name: "Electric Vehicle Parking",
    description: "Designated parking spaces for electric vehicles",
    category: "physical",
    icon: "car",
  },
  {
    name: "Elevator",
    description: "Vertical transportation between floors",
    category: "physical",
    icon: "elevator",
  },
  {
    name: "Frequent Seating / Rest Points",
    description: "Regularly spaced seating areas for rest breaks",
    category: "physical",
    icon: "bench",
  },
  {
    name: "Garage Parking",
    description: "Indoor parking facility",
    category: "physical",
    icon: "car",
  },
  {
    name: "Gender Neutral Washroom",
    description: "Bathroom facilities available to all genders",
    category: "physical",
    icon: "bathroom",
  },
  {
    name: "Handicap Accessible Door",
    description: "Door designed for wheelchair users",
    category: "physical",
    icon: "door",
  },
  {
    name: "Handrails",
    description: "Support rails along walls or stairs",
    category: "physical",
    icon: "handrail",
  },
  {
    name: "Lowered Changing Tables",
    description: "Changing tables at a height accessible to wheelchair users",
    category: "physical",
    icon: "table",
  },
  {
    name: "Lowered Counters",
    description: "Service counters at a height accessible to wheelchair users",
    category: "physical",
    icon: "counter",
  },
  {
    name: "Lowered Sinks",
    description: "Sinks at a height accessible to wheelchair users",
    category: "physical",
    icon: "sink",
  },
  {
    name: "Motion Sensor Lighting",
    description: "Lights that activate automatically with movement",
    category: "physical",
    icon: "light",
  },
  {
    name: "Outdoor Access Only",
    description: "Facility only accessible from outside",
    category: "physical",
    icon: "door",
  },
  {
    name: "Ramp",
    description: "Sloped surface for wheelchair access",
    category: "physical",
    icon: "ramp",
  },
  {
    name: "Service Animal Friendly",
    description: "Facility welcomes service animals",
    category: "physical",
    icon: "paw",
  },
  {
    name: "Single Use Washroom",
    description: "Private bathroom for individual use",
    category: "physical",
    icon: "bathroom",
  },
  {
    name: "Spacious",
    description: "Ample space for wheelchair movement",
    category: "physical",
    icon: "space",
  },
  {
    name: "Valet Parking",
    description: "Parking service available",
    category: "physical",
    icon: "car",
  },
  {
    name: "Well lit parking",
    description: "Parking area with good lighting",
    category: "physical",
    icon: "light",
  },
  {
    name: "Well-Lit Path to Entrance",
    description: "Well-illuminated path leading to the entrance",
    category: "physical",
    icon: "path",
  },
  {
    name: "Wheelchair Accessible Door",
    description: "Door designed for wheelchair users",
    category: "physical",
    icon: "door",
  },
  {
    name: "Wheelchair Accessible Phone",
    description: "Phone at a height accessible to wheelchair users",
    category: "physical",
    icon: "phone",
  },
  {
    name: "Wheelchair Ramp",
    description: "Ramp specifically designed for wheelchair access",
    category: "physical",
    icon: "ramp",
  },
  {
    name: "Wide hallway",
    description: "Hallways wide enough for wheelchair movement",
    category: "physical",
    icon: "hallway",
  },
  {
    name: "WiFi Access",
    description: "Wireless internet access available",
    category: "physical",
    icon: "wifi",
  },

  // Sensory Accessibility Tags
  {
    name: "Adjustable Lighting",
    description: "Lighting that can be adjusted for different needs",
    category: "sensory",
    icon: "light",
  },
  {
    name: "Audio Guidance",
    description: "Audio assistance for navigation",
    category: "sensory",
    icon: "audio",
  },
  {
    name: "Auditory Signals",
    description: "Sound-based alerts and notifications",
    category: "sensory",
    icon: "sound",
  },
  {
    name: "Braille keyboard",
    description: "Keyboard with Braille labels",
    category: "sensory",
    icon: "keyboard",
  },
  {
    name: "Braille Menu",
    description: "Menu available in Braille format",
    category: "sensory",
    icon: "menu",
  },
  {
    name: "Braille signs",
    description: "Signage with Braille text",
    category: "sensory",
    icon: "sign",
  },
  {
    name: "Hearing Loop",
    description: "Induction loop system for hearing aid users",
    category: "sensory",
    icon: "sound",
  },
  {
    name: "High-Contrast Signage",
    description: "Signs with high contrast colors for better visibility",
    category: "sensory",
    icon: "sign",
  },
  {
    name: "Large Print",
    description: "Materials available in large print format",
    category: "sensory",
    icon: "text",
  },
  {
    name: "Lighting - Bright",
    description: "Well-lit environment with bright lighting",
    category: "sensory",
    icon: "light",
  },
  {
    name: "Lighting - Dim",
    description: "Environment with reduced lighting",
    category: "sensory",
    icon: "light",
  },
  {
    name: "Quiet",
    description: "Low-noise environment",
    category: "sensory",
    icon: "sound",
  },
  {
    name: "Scent Free",
    description: "Environment free of strong scents",
    category: "sensory",
    icon: "nose",
  },
  {
    name: "Screen Reader",
    description: "Screen reading software available",
    category: "sensory",
    icon: "screen",
  },
  {
    name: "Sensory Friendly",
    description: "Environment designed to be sensory-friendly",
    category: "sensory",
    icon: "sensory",
  },
  {
    name: "Sensory Room",
    description: "Dedicated space for sensory regulation",
    category: "sensory",
    icon: "room",
  },
  {
    name: "Shaded Areas",
    description: "Areas with protection from bright light",
    category: "sensory",
    icon: "shade",
  },
  {
    name: "Sign language",
    description: "Sign language interpretation available",
    category: "sensory",
    icon: "sign",
  },
  {
    name: "Tactile Pavement",
    description: "Textured ground surface for navigation",
    category: "sensory",
    icon: "ground",
  },
  {
    name: "Tactile Signs",
    description: "Signs with raised or textured elements",
    category: "sensory",
    icon: "sign",
  },
  {
    name: "Tactile Surfaces",
    description: "Surfaces with distinct textures for navigation",
    category: "sensory",
    icon: "surface",
  },
  {
    name: "Textured/Visual Wayfinding",
    description: "Visual and tactile navigation aids",
    category: "sensory",
    icon: "navigation",
  },
  {
    name: "Visual Alerts",
    description: "Visual notifications and warnings",
    category: "sensory",
    icon: "alert",
  },

  // Cognitive Accessibility Tags
  {
    name: "Assistive Technology",
    description: "Technology to support cognitive accessibility",
    category: "cognitive",
    icon: "tech",
  },
  {
    name: "Clear Signage",
    description: "Easy-to-read and understand signs",
    category: "cognitive",
    icon: "sign",
  },
  {
    name: "Easy To Read Signs",
    description: "Signs with simple, clear language",
    category: "cognitive",
    icon: "sign",
  },
  {
    name: "Extended Service Hours",
    description: "Longer operating hours for flexibility",
    category: "cognitive",
    icon: "clock",
  },
  {
    name: "Flexible Hours",
    description: "Adaptable scheduling options",
    category: "cognitive",
    icon: "clock",
  },
  {
    name: "Low Distraction Zones",
    description: "Areas designed to minimize distractions",
    category: "cognitive",
    icon: "zone",
  },
  {
    name: "Low Stimulation Zones",
    description: "Areas with reduced sensory stimulation",
    category: "cognitive",
    icon: "zone",
  },
  {
    name: "Memory Support",
    description: "Features to assist with memory",
    category: "cognitive",
    icon: "brain",
  },
  {
    name: "Non/Low-Glare Lighting",
    description: "Lighting designed to reduce glare",
    category: "cognitive",
    icon: "light",
  },
  {
    name: "Picture Menus",
    description: "Menus with visual representations",
    category: "cognitive",
    icon: "menu",
  },
  {
    name: "Quiet Areas",
    description: "Spaces designed for reduced noise",
    category: "cognitive",
    icon: "sound",
  },
  {
    name: "Simple Instructions",
    description: "Clear, straightforward directions",
    category: "cognitive",
    icon: "instructions",
  },
  {
    name: "Simplified Payment Options",
    description: "Straightforward payment processes",
    category: "cognitive",
    icon: "payment",
  },
  {
    name: "Step-By-Step Guidance",
    description: "Clear, sequential instructions",
    category: "cognitive",
    icon: "steps",
  },
  {
    name: "Visual Support",
    description: "Visual aids to support understanding",
    category: "cognitive",
    icon: "visual",
  },
  {
    name: "Visual and Auditory Landmarks",
    description: "Distinctive features for navigation",
    category: "cognitive",
    icon: "landmark",
  },
  {
    name: "Visual Schedules",
    description: "Visual timetables and schedules",
    category: "cognitive",
    icon: "schedule",
  },
  {
    name: "Back Support Seating",
    description: "Seating with proper back support",
    category: "physical",
    icon: "chair",
  },
];

const seedAccessTags = async () => {
  try {
    console.log("Starting to seed access tags...");
    for (const tag of accessTags) {
      await addAccessTag(tag);
      console.log(`Added tag: ${tag.name}`);
    }
    console.log("Successfully seeded all access tags!");
  } catch (error) {
    console.error("Error seeding access tags:", error);
  }
};

// Run the seeding function
seedAccessTags();

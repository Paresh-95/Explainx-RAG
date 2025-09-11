import { ResourcesClient } from "../../../../components/resources/ResourcesClient";
import { ResourceType } from "../../../../types/resources";

const resources: ResourceType[] = [
  {
    title: "Awesome Prompts for today's AI",
    description:
      "A curated list of prompts for AI models, including GPT-4, Claude, and more.",
    link: "/r/prompt/prompts.pdf",
    type: "pdf",
  },
];

export default function ResourcesPage() {
  return (
    <ResourcesClient
      resources={resources}
      heading="Prompt Library"
      emailGate={true}
    />
  );
}

type VisualLookup = {
  imagePath: string;
};

const visualsByTitle: Record<string, VisualLookup> = {
  "neon-rooftop-session": {
    imagePath: "/event-backgrounds/neon-rooftop-session.png"
  },
  "founders-sprint-workshop": {
    imagePath: "/event-backgrounds/founders-sprint-workshop.png"
  },
  "sunrise-reset-club": {
    imagePath: "/event-backgrounds/sunrise-reset-club.png"
  }
};

const visualsByCategory: Record<string, VisualLookup> = {
  music: {
    imagePath: "/event-backgrounds/neon-rooftop-session.png"
  },
  workshop: {
    imagePath: "/event-backgrounds/founders-sprint-workshop.png"
  },
  wellness: {
    imagePath: "/event-backgrounds/sunrise-reset-club.png"
  }
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEventVisual(title: string, category: string) {
  const titleMatch = visualsByTitle[slugify(title)];
  if (titleMatch) {
    return titleMatch;
  }

  return visualsByCategory[slugify(category)] ?? {
    imagePath: "/event-backgrounds/founders-sprint-workshop.png"
  };
}

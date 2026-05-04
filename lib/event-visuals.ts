type VisualLookup = {
  imagePath: string;
  imagePosition: {
    compact: string;
    showcase: string;
    detail: string;
  };
  imageSize: {
    compact: string;
    showcase: string;
    detail: string;
  };
};

const visualsByTitle: Record<string, VisualLookup> = {
  "neon-rooftop-session": {
    imagePath: "/event-backgrounds/neon-rooftop-session.png",
    imagePosition: {
      compact: "center 58%",
      showcase: "center 58%",
      detail: "center 58%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  },
  "founders-sprint-workshop": {
    imagePath: "/event-backgrounds/founders-sprint-workshop.png",
    imagePosition: {
      compact: "center 36%",
      showcase: "center 24%",
      detail: "center 30%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  },
  "sunrise-reset-club": {
    imagePath: "/event-backgrounds/sunrise-reset-club.png",
    imagePosition: {
      compact: "center 34%",
      showcase: "center 72%",
      detail: "center 62%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  }
};

const visualsByCategory: Record<string, VisualLookup> = {
  music: {
    imagePath: "/event-backgrounds/neon-rooftop-session.png",
    imagePosition: {
      compact: "center 58%",
      showcase: "center 58%",
      detail: "center 58%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  },
  workshop: {
    imagePath: "/event-backgrounds/founders-sprint-workshop.png",
    imagePosition: {
      compact: "center 36%",
      showcase: "center 24%",
      detail: "center 30%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  },
  wellness: {
    imagePath: "/event-backgrounds/sunrise-reset-club.png",
    imagePosition: {
      compact: "center 34%",
      showcase: "center 72%",
      detail: "center 62%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  }
};

// Keeps title/category matching stable even when incoming data contains spaces or punctuation.
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Resolves the artwork and focal points used by compact cards, showcase cards, and detail heroes.
export function getEventVisual(title: string, category: string) {
  const titleMatch = visualsByTitle[slugify(title)];
  if (titleMatch) {
    return titleMatch;
  }

  return visualsByCategory[slugify(category)] ?? {
    imagePath: "/event-backgrounds/founders-sprint-workshop.png",
    imagePosition: {
      compact: "center 36%",
      showcase: "center 24%",
      detail: "center 30%"
    },
    imageSize: {
      compact: "cover",
      showcase: "cover",
      detail: "cover"
    }
  };
}

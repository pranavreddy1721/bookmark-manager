import { GraphQLError } from "graphql";

export type BookmarkInput = {
  title: string;
  url: string;
  tags: string[];
  folderId: string;
};

function validationError(message: string): never {
  throw new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
    },
  });
}

export function validateBookmarkInput(input: BookmarkInput): void {
  if (!input.title.trim()) {
    validationError("Title is required");
  }

  if (input.title.length > 200) {
    validationError("Title must be 200 characters or fewer");
  }

  if (!input.url.trim()) {
    validationError("URL is required");
  }

  try {
    new URL(input.url);
  } catch {
    validationError("URL must be valid");
  }

  if (!input.folderId.trim()) {
    validationError("Folder ID is required");
  }

  if (input.tags.length > 20) {
    validationError("A bookmark can have at most 20 tags");
  }

  for (const tag of input.tags) {
    if (!tag.trim()) {
      validationError("Tags cannot be empty");
    }

    if (tag.length > 50) {
      validationError("Each tag must be 50 characters or fewer");
    }
  }
}
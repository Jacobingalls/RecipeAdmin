interface SourceNote {
  source: { url: string; title?: string };
}

interface TextContent {
  markdown?: string;
  text?: string;
}

interface InformationNote {
  information: TextContent;
}

interface WarningNote {
  warning: TextContent;
}

interface SevereNote {
  severe: TextContent;
}

/**
 * A note attached to a product, group, preparation, barcode or custom size.
 *
 * The API sends either a plain string or one of the tagged object forms;
 * `NotesDisplay` renders each variant.
 */
export type Note = SourceNote | InformationNote | WarningNote | SevereNote | string;

import { Event, Document, User } from "@server/models";
import { DocumentHelper } from "@server/models/helpers/DocumentHelper";
import { APIContext } from "@server/types";

type Props = {
  /** The user updating the document */
  user: User;
  /** The existing document */
  document: Document;
  /** The new title */
  title?: string;
  /** The document icon */
  icon?: string | null;
  /** The document icon's color */
  color?: string | null;
  /** The new text content */
  text?: string;
  /** Whether the editing session is complete */
  done?: boolean;
  /** The version of the client editor that was used */
  editorVersion?: string;
  /** The ID of the template that was used */
  templateId?: string | null;
  /** If the document should be displayed full-width on the screen */
  fullWidth?: boolean;
  /** Whether insights should be visible on the document */
  insightsEnabled?: boolean;
  /** Whether the text be appended to the end instead of replace */
  append?: boolean;
};

/**
 * This command updates document properties. To update collaborative text state
 * use documentCollaborativeUpdater.
 *
 * @param Props The properties of the document to update
 * @returns Document The updated document
 */
export default async function documentUpdater(
  ctx: APIContext,
  {
    user,
    document,
    title,
    icon,
    color,
    text,
    editorVersion,
    templateId,
    fullWidth,
    insightsEnabled,
    append,
    done,
  }: Props
): Promise<Document> {
  const { transaction } = ctx.state;
  const previousTitle = document.title;

  if (title !== undefined) {
    document.title = title.trim();
  }
  if (icon !== undefined) {
    document.icon = icon;
  }
  if (color !== undefined) {
    document.color = color;
  }
  if (editorVersion) {
    document.editorVersion = editorVersion;
  }
  if (templateId) {
    document.templateId = templateId;
  }
  if (fullWidth !== undefined) {
    document.fullWidth = fullWidth;
  }
  if (insightsEnabled !== undefined) {
    document.insightsEnabled = insightsEnabled;
  }
  if (text !== undefined) {
    document = DocumentHelper.applyMarkdownToDocument(document, text, append);
  }

  const changed = document.changed();

  const event = {
    name: "documents.update",
    documentId: document.id,
    collectionId: document.collectionId,
    data: {
      done,
      title: document.title,
    },
  };

  // Note: Moving a document to a different collection should be done through the
  // documents.move endpoint, not documents.update, to ensure proper structure updates

  if (changed) {
    document.lastModifiedById = user.id;
    document.updatedBy = user;
    await document.save({ transaction });

    await Event.createFromContext(ctx, event);
  } else if (done) {
    await Event.schedule({
      ...event,
      actorId: user.id,
      teamId: document.teamId,
    });
  }

  if (document.title !== previousTitle) {
    await Event.schedule({
      name: "documents.title_change",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        previousTitle,
        title: document.title,
      },
      ip: ctx.request.ip,
    });
  }

  return await Document.findByPk(document.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction,
  });
}

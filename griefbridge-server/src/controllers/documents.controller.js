import Document from '../models/Document.model.js';
import Case from '../models/Case.model.js';

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { caseId, documentType } = req.body;
    const { filename, originalname, mimetype, size } = req.file;

    const doc = await Document.create({
      caseId,
      type: documentType,
      filename,
      originalName: originalname,
      mimeType: mimetype,
      gridfsId: req.file.id,
      uploadedBy: req.userId,
      fileSize: size
    });

    const caseDoc = await Case.findById(caseId);
    if (caseDoc) {
      for (const proc of caseDoc.procedures) {
        if (proc.requiredDocTypes && proc.requiredDocTypes.includes(documentType)) {
          if (!proc.associatedDocuments) proc.associatedDocuments = [];
          if (!proc.associatedDocuments.includes(docId)) {
            proc.associatedDocuments.push(docId);
          }
        }
      }
      await caseDoc.save();
    }

    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
}

export async function getDocuments(req, res, next) {
  try {
    const { caseId } = req.params;
    const { type } = req.query;

    const query = { caseId };
    if (type) query.type = type;

    const documents = await Document.find(query).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Document.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateDocumentType(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.body;

    const doc = await Document.findByIdAndUpdate(
      id,
      { type },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(doc);
  } catch (error) {
    next(error);
  }
}

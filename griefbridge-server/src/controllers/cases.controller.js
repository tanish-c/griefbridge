import Case from '../models/Case.model.js';
import { matchProcedures } from '../services/ir.service.js';
import { getProcedureGuide, getAllProcedureGuides } from '../services/procedureGuide.service.js';

export async function createCase(req, res, next) {
  try {
    const { deceased, intakeAnswers } = req.body;

    if (!deceased || !intakeAnswers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const procedures = await matchProcedures(intakeAnswers, new Date(deceased.dateOfDeath));

    const caseDoc = await Case.create({
      ownerId: req.userId,
      deceased: {
        name: deceased.name,
        dateOfDeath: new Date(deceased.dateOfDeath),
        state: deceased.state,
        intakeAnswers
      },
      procedures
    });

    res.status(201).json(caseDoc);
  } catch (error) {
    next(error);
  }
}

export async function getCases(req, res, next) {
  try {
    const cases = await Case.find({
      $or: [
        { ownerId: req.userId },
        { 'collaborators.userId': req.userId }
      ]
    }).sort({ createdAt: -1 });

    res.json(cases);
  } catch (error) {
    next(error);
  }
}

export async function getCase(req, res, next) {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      $or: [
        { ownerId: req.userId },
        { 'collaborators.userId': req.userId }
      ]
    });

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(caseDoc);
  } catch (error) {
    next(error);
  }
}

export async function updateProcedureStatus(req, res, next) {
  try {
    const { id, procedureId } = req.params;
    const { status } = req.body;

    const validStatuses = ['NOT_STARTED', 'UNLOCKED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const proc = caseDoc.procedures.find(p => p.procedureId === procedureId);
    if (!proc) {
      return res.status(404).json({ error: 'Procedure not found' });
    }

    proc.status = status;
    if (status === 'COMPLETED') {
      proc.completedAt = new Date();
    }

    // Unlock dependent procedures
    if (status === 'COMPLETED') {
      for (const p of caseDoc.procedures) {
        if (p.dependencies && p.dependencies.includes(procedureId) && p.status === 'NOT_STARTED') {
          p.status = 'UNLOCKED';
        }
      }
    }

    await caseDoc.save();
    res.json(caseDoc);
  } catch (error) {
    next(error);
  }
}

export async function deleteCase(req, res, next) {
  try {
    const caseDoc = await Case.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.userId
    });

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getProcedureGuideDetails(req, res, next) {
  try {
    const { id, procedureId } = req.params;

    const caseDoc = await Case.findOne({
      _id: id,
      $or: [
        { ownerId: req.userId },
        { 'collaborators.userId': req.userId }
      ]
    });

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const procedure = caseDoc.procedures.find(p => p.procedureId === procedureId);
    if (!procedure) {
      return res.status(404).json({ error: 'Procedure not found' });
    }

    const guide = getProcedureGuide(procedureId, caseDoc);
    res.json({
      procedure,
      guide
    });
  } catch (error) {
    next(error);
  }
}

export async function getCaseWithGuides(req, res, next) {
  try {
    const caseDoc = await Case.findOne({
      _id: req.params.id,
      $or: [
        { ownerId: req.userId },
        { 'collaborators.userId': req.userId }
      ]
    });

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const proceduresWithGuides = caseDoc.procedures.map(proc => ({
      ...proc.toObject(),
      guide: getProcedureGuide(proc.procedureId, caseDoc)
    }));

    res.json({
      ...caseDoc.toObject(),
      proceduresWithGuides
    });
  } catch (error) {
    next(error);
  }
}

import Notification from '../models/Notification.model.js';
import Case from '../models/Case.model.js';

export async function checkDeadlines() {
  try {
    const cases = await Case.find({
      'procedures.status': { $nin: ['COMPLETED', 'BLOCKED'] }
    });

    const now = new Date();

    for (const caseDoc of cases) {
      for (const proc of caseDoc.procedures) {
        if (!proc.deadline || proc.status === 'COMPLETED') continue;

        const daysRemaining = Math.ceil(
          (new Date(proc.deadline) - now) / (1000 * 60 * 60 * 24)
        );

        let notificationType = null;
        let message = '';

        if (daysRemaining < 0) {
          notificationType = 'ALERT';
          message = `${proc.title} is overdue by ${Math.abs(daysRemaining)} days!`;
          proc.status = 'OVERDUE';
        } else if (daysRemaining === 1) {
          notificationType = 'DEADLINE_UPCOMING';
          message = `${proc.title} deadline is tomorrow!`;
        } else if (daysRemaining === 7) {
          notificationType = 'DEADLINE_UPCOMING';
          message = `${proc.title} deadline is in 7 days`;
        } else if (daysRemaining === 30) {
          notificationType = 'REMINDER';
          message = `${proc.title} deadline is in 30 days`;
        }

        if (notificationType) {
          const existing = await Notification.findOne({
            caseId: caseDoc._id,
            procedureId: proc.procedureId,
            type: notificationType,
            createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
          });

          if (!existing) {
            await Notification.create({
              caseId: caseDoc._id,
              userId: caseDoc.ownerId,
              type: notificationType,
              procedureId: proc.procedureId,
              title: proc.title,
              message
            });
          }
        }
      }

      await caseDoc.save();
    }

    console.log('Deadline check completed');
  } catch (error) {
    console.error('Error in deadline checker:', error);
  }
}

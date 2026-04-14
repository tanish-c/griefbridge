import Notification from '../models/Notification.model.js';

export async function getNotifications(req, res, next) {
  try {
    const { caseId } = req.query;

    const query = { userId: req.userId };
    if (caseId) query.caseId = caseId;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
}

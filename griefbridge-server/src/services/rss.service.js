import RSS from 'rss';

export function generateCaseRssFeed(caseData, baseUrl) {
  const feed = new RSS({
    title: `GriefBridge Deadlines — Case ${caseData.caseId}`,
    description: 'Upcoming legal deadlines for your bereavement case',
    feed_url: `${baseUrl}/api/cases/${caseData._id}/rss`,
    site_url: `${baseUrl}/case/${caseData.caseId}`,
    language: 'en-IN',
    ttl: 60
  });

  const now = new Date();
  const pendingWithDeadlines = caseData.procedures
    .filter(p => p.deadline && !['COMPLETED'].includes(p.status))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  for (const proc of pendingWithDeadlines) {
    const days = Math.ceil((new Date(proc.deadline) - now) / (1000 * 60 * 60 * 24));
    const prefix = days < 0 ? 'OVERDUE: ' :
                   days <= 7 ? 'URGENT: ' :
                   days <= 30 ? 'REMINDER: ' : '';
    const daysStr = days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`;

    feed.item({
      title: `${prefix}${proc.title} — ${daysStr}`,
      description: `${proc.title} at ${proc.department}. Legal deadline: ${new Date(proc.deadline).toDateString()}. Status: ${proc.status}.`,
      url: `${baseUrl}/case/${caseData.caseId}#${proc.procedureId}`,
      guid: `${caseData.caseId}-${proc.procedureId}-DEADLINE`,
      date: new Date()
    });
  }

  return feed.xml({ indent: true });
}

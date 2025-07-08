export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

import { format, isToday, isYesterday } from 'date-fns';
export function formatMessageTime(timestamp: string) {
  try {
    return format(new Date(timestamp), 'HH:mm');
  } catch {
    return 'Now';
  }
}

export function formatMessageDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
}

export function groupMessagesByDate(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = [];
  let currentDate = '';
  let currentGroup: any[] = [];

  messages.forEach((message) => {
    try {
      const messageDate = new Date(message.createdAt);
      if (isNaN(messageDate.getTime())) {
        return;
      }
      const dateKey = format(messageDate, 'yyyy-MM-dd');

      if (dateKey !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = dateKey;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    } catch (error) {
      console.warn('Invalid message date:', message.createdAt);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({ date: currentDate, messages: currentGroup });
  }

  return groups;
} 
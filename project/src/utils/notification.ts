// Mock email notification system
// In a real application, this would interact with a backend API to send emails

export const sendEmail = (to: string, subject: string, body: string): Promise<boolean> => {
  console.log(`MOCK EMAIL to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // In a real app, this would send an actual email
  // For our demo, we'll just log it and return success
  return Promise.resolve(true);
};

export const sendReservationConfirmation = (
  studentEmail: string, 
  studentName: string, 
  date: string, 
  startTime: string, 
  endTime: string, 
  subject: string
): Promise<boolean> => {
  const emailSubject = 'I Studio 予約確認';
  const emailBody = `
${studentName}様

I Studioの予約が確定しました。

日時: ${date} ${startTime}～${endTime}
科目: ${subject}

ご予約の10分前には会場にお越しください。
キャンセルの場合は予約システムからキャンセル手続きを行ってください。

I Studio予約システム
`;

  return sendEmail(studentEmail, emailSubject, emailBody);
};

export const sendReservationNotification = (
  teacherEmail: string,
  teacherName: string,
  studentName: string,
  date: string,
  startTime: string,
  endTime: string,
  subject: string
): Promise<boolean> => {
  const emailSubject = 'I Studio 新規予約通知';
  const emailBody = `
${teacherName}様

I Studioに新しい予約が入りました。

学生: ${studentName}
日時: ${date} ${startTime}～${endTime}
科目: ${subject}

I Studio予約システム
`;

  return sendEmail(teacherEmail, emailSubject, emailBody);
};

export const sendReminderNotification = (
  email: string,
  name: string,
  date: string,
  startTime: string,
  endTime: string,
  subject: string,
  isTeacher: boolean
): Promise<boolean> => {
  const emailSubject = 'I Studio 予約リマインダー';
  const emailBody = `
${name}様

I Studioの予約が明日に迫っています。

日時: ${date} ${startTime}～${endTime}
科目: ${subject}

${isTeacher ? 'ご対応' : 'ご来場'}よろしくお願いいたします。

I Studio予約システム
`;

  return sendEmail(email, emailSubject, emailBody);
};

export const scheduleReminders = (
  reservation: any,
  studentEmail: string,
  studentName: string,
  teacherEmail: string,
  teacherName: string,
  subjectName: string
): void => {
  // In a real app, this would schedule reminders using a job system
  console.log('Reminders scheduled for reservation:', reservation.id);
};
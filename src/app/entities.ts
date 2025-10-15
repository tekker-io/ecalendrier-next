export interface Calendar {
  id: string;
  author: string;
  name: string;
  startDate?: string;
  endDate?: string;
  demo?: boolean;
  displayLogo?: boolean;
  displayCta?: boolean;
}

export const calendarConverter: FirebaseFirestore.FirestoreDataConverter<Calendar> =
  {
    toFirestore: (data) => data,
    fromFirestore: (snap) => ({
      id: snap.id,
      ...(snap.data() as Omit<Calendar, 'id'>),
    }),
  };

import { collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { residences, roomTypes, bookings } from '../data/mockData';

export const migrateData = async () => {
  try {
    console.log('Starting migration...');

    // Migrate residences
    for (const residence of residences) {
      const { id, ...data } = residence;
      await setDoc(doc(db, 'residences', id), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    console.log('✓ Residences migrated');

    // Migrate room types
    for (const roomType of roomTypes) {
      const { id, ...data } = roomType;
      await setDoc(doc(db, 'roomTypes', id), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    console.log('✓ Room types migrated');

    // Migrate bookings
    for (const booking of bookings) {
      const { id, checkIn, checkOut, ...data } = booking;
      await addDoc(collection(db, 'bookings'), {
        ...data,
        checkIn: checkIn.toDate(),
        checkOut: checkOut.toDate(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    console.log('✓ Bookings migrated');

    // Set initial settings
    await setDoc(doc(db, 'settings', 'general'), {
      minimumStayMonths: 1,
      updatedAt: Timestamp.now(),
      updatedBy: 'system'
    });
    console.log('✓ Settings initialized');

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

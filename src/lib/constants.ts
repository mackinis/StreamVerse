
import type { Course, UserStory, User } from '@/types';

export const MOCK_COURSES: Course[] = [
  // Courses will be managed via Firestore in the future.
  // For now, this array will be empty or the course feature will indicate "coming soon".
];

export const MOCK_USER_STORIES: UserStory[] = [
  // User stories will be fetched from Firestore.
];

export const MOCK_USERS: Record<string, User> = {
 // Users will be fetched from Firestore.
};

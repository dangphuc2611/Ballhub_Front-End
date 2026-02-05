export type ReviewItem = {
  reviewId: number;
  userId: number;
  fullName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ReviewResponse = {
  avgRating: number;
  totalReviews: number;
  items: ReviewItem[];
};
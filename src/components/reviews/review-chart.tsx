"use client";

import { ReviewsWithUser } from "@/lib/infer-type";
import { Card, CardDescription, CardTitle } from "../ui/card";
import Stars from "./stars";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";

export default function ReviewChart({
  reviews,
}: {
  reviews: ReviewsWithUser[];
}) {
  const totalReviews = reviews.length;
  const avg =
    totalReviews > 0
      ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews
      : 0;
  const getRatingByStars = useMemo(() => {
    const ratingValues = Array.from({ length: 5 }, () => 0);
    const totalReviews = reviews.length;

    reviews.forEach((review) => {
      const starIndex = review.rating - 1;
      if (starIndex >= 0 && starIndex < 5) {
        ratingValues[starIndex]++;
      }
    });

    return totalReviews > 0
      ? ratingValues.map((rating) => (rating / totalReviews) * 100)
      : [0, 0, 0, 0, 0];
  }, [reviews]);

  return (
    <Card className="flex flex-col p-8 rounded-md gap-4">
      <div className="flex flex-col gap-2 items-start">
        <CardTitle>Product Rating:</CardTitle>
        <CardDescription className="text-lg font-medium">
          {avg.toFixed(1)} stars
        </CardDescription>
      </div>
      {getRatingByStars.map((rating, index) => (
        <div key={index} className="flex gap-2 justify-between items-center">
          <p className="text-xs font-medium flex gap-1">
            {index + 1} <span>stars</span>
          </p>
          <Progress value={rating} />
        </div>
      ))}
    </Card>
  );
}

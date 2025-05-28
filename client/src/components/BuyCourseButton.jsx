import React, { useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateCheckoutSessionMutation } from "../features/api/purchaseApi";

const BuyCourseButton = ({ courseId, isPurchased, onSuccess }) => {
  const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] = 
    useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    if (isPurchased) {
      // If already purchased, just trigger the success handler
      onSuccess && onSuccess();
      return;
    }
    await createCheckoutSession(courseId);
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server.");
      }
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error]);

  return (
    <button
      onClick={purchaseCourseHandler}
      className={`w-full font-medium py-2 px-4 rounded-md 
                transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed
                inline-flex items-center justify-center gap-2
                ${isPurchased 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      disabled={isLoading && !isPurchased}
    >
      {isLoading && !isPurchased ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : isPurchased ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          {onSuccess ? "Go to Course" : "Purchased"}
        </>
      ) : (
        "Purchase Course"
      )}
    </button>
  );
};

export default BuyCourseButton;
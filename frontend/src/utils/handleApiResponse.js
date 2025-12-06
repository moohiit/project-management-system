import toast from "react-hot-toast";

/**
 * res: AxiosResponse
 * options: { showSuccess?: boolean, successMessage?: string }
 */
export const handleApiResponse = (res, options = {}) => {
  const { showSuccess = true, successMessage } = options;

  const data = res?.data || {};
  const success = data.success;
  const message =
    data.message || (success ? "Success" : "Something went wrong");

  if (success) {
    if (showSuccess) {
      toast.success(successMessage || message);
    }
  } else {
    toast.error(message);
  }

  return data; // so you can use data.data if needed
};

/**
 * handle API error (catch block)
 */
export const handleApiError = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  const msg =
    error?.response?.data?.message || error?.message || fallbackMessage;

  toast.error(msg);
};

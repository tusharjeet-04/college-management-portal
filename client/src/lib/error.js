export function getErrorMessage(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (data?.details?.length) {
    return data.details.map((d) => d.message).join(', ');
  }
  return data?.message || err?.message || fallback;
}

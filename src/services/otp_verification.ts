const isOTPExpired = (expirationTime: number) => {
  const currentTime = Date.now();
  return currentTime > expirationTime;
};

export default isOTPExpired;

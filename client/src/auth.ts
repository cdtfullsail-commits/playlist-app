// client/src/auth.ts
export const isLoggedIn = () => {
  return localStorage.getItem("authToken") !== null;
};

export const logout = () => {
  localStorage.removeItem("authToken");
};

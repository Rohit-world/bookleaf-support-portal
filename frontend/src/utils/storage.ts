export const storage = {
  getToken: () => localStorage.getItem("accessToken"),

  setToken: (token: string) => {
    localStorage.setItem("accessToken", token);
  },

  removeToken: () => {
    localStorage.removeItem("accessToken");
  },

  getUser: () => {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  },

  setUser: (user: unknown) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem("user");
  },

  clear: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },
};

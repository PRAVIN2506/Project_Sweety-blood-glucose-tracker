import axios from "axios";

const getTimeZone = (): string => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz && typeof tz === "string" ? tz : "UTC";
    } catch {
        return "UTC";
    }
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["X-Time-Zone"] = getTimeZone();

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;

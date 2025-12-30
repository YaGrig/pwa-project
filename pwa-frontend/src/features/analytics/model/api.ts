import { FetchOptions, fetchWithJWT } from "../../../common/http";
import { FilterFields } from "../lib/hooks/types/filter";

export const AnalyticsAPI = {
  getUserAnalytics: async () => {
    const payload: FetchOptions = {
      link: "http://localhost:3001/analytics/all",
      options: {
        method: "GET",
        // credentials: "include",
      },
    };
    return await fetchWithJWT(payload);
  },

  getUserAnalyticsMonth: async (filters: FilterFields) => {
    const payload: FetchOptions = {
      link: "http://localhost:3001/analytics/month",
      options: {
        method: "POST",
        body: JSON.stringify(filters),
        // credentials: "include",
      },
    };

    console.log("doubdlchek");
    const res = await fetchWithJWT(payload);
    console.log(res, "dddudud");
    return res;
  },
};

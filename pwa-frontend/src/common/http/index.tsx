// export enum Methods {
//   GET = "GET",
//   POST = "POST",
// }

export interface FetchOptions {
  link: string;
  options: Record<string, string | Record<string, string>>;
}

export const fetchWithJWT = async (payload: FetchOptions) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("no token");
  }
  const response = await fetch(payload.link, {
    ...payload.options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
};

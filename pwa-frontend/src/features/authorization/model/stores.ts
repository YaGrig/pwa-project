import { createStore, createEvent, createEffect, sample } from "effector";
import { LoginFormFields } from "../lib/types";

interface UserInfo {
  email: string;
  name: string;
}

export enum modeTypes {
  login = "login",
  registration = "registration",
}

// type modeType = "login" | "registration";

export const loginFormSubmitted = createEvent<LoginFormFields>();
export const LogoutClicked = createEvent();
export const authFormOpened = createEvent();
export const authFormClosed = createEvent();
export const emailChanged = createEvent<string>();
export const passwordChanged = createEvent<string>();
export const nameChanged = createEvent<string>();
export const appStarted = createEvent();
export const logoutEvent = createEvent();
export const redirectEvent = createEvent();
export const openModalEvent = createEvent<boolean>();
export const changeModeEvent = createEvent<modeTypes>();

//tanStack events

export const authSuccess = createEvent<{ data: UserInfo }>();
export const authFailed = createEvent();
export const authChecked = createEvent();

export const $modeModal = createStore<modeTypes>(modeTypes.login);

export const $loginForm = createStore({
  email: "",
  name: "",
  password: "",
});

export const $userInfo = createStore({
  email: "",
  name: "",
});

export const $jwt_token = createStore("");

export const $isUserLoggedIn = $jwt_token.map((token) => !!token);

// export $user = createStore({
//   email
// })

export const $isAuthFormOpen = createStore(false);
export const $isLoginFormOpen = createStore(false);
export const $authError = createStore(false);
export const $modalOpen = createStore(false);

$modeModal.on(changeModeEvent, (_, payload) => payload);

$modalOpen.on(openModalEvent, (_, payload) => payload);

export const $loginFormErrors = $loginForm.map((form) => {
  const errors: string[] = [];
  if (form.email && !form.email.includes("@")) {
    errors.push("Email должен содержать @");
  }
  if (form.password && form.password.length < 6) {
    errors.push("Пароль должен быть не менее 6 символов");
  }
  return errors;
});

export const $isLoginFormValid = $loginForm.map(
  (form) => form.email.includes("@") && form.password.length >= 6
);

$authError.on(redirectEvent, () => {
  return true;
});

$userInfo.on(authSuccess, (_, data: { data: UserInfo }) => data.data);

$loginForm
  .on(nameChanged, (state, name) => ({
    ...state,
    name,
  }))
  .on(emailChanged, (state, email) => ({
    ...state,
    email,
  }))
  .on(passwordChanged, (state, password) => ({
    ...state,
    password,
  }));

export const refreshTokenFx = createEffect<void, { jwt_token: string }, Error>(
  async () => {
    try {
      const res = await fetch(`http://localhost:3001/auth/refresh`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          redirectEvent();
        }
        localStorage.removeItem("token");

        throw new Error(`Refresh failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.data?.jwt_token) {
        throw new Error("Invalid response structure");
      }
      localStorage.setItem("token", data.data.jwt_token);
      return { jwt_token: data.data.jwt_token };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error during token refresh");
    }
  }
);

export const logoutFx = createEffect(async (token: string) => {
  const res = await fetch(`http://localhost:3001/auth/logout`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
});

$jwt_token.on(refreshTokenFx.doneData, (_, token) => {
  return token.jwt_token;
});

sample({
  clock: appStarted,
  target: refreshTokenFx,
});

sample({
  clock: logoutEvent,
  source: $jwt_token,
  target: logoutFx,
});

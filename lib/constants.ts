// Estados de un miembro
export const MEMBER_STATUS_PENDING: number = 0;
export const MEMBER_STATUS_INACTIVE: number = 1;
export const MEMBER_STATUS_ACTIVE: number = 2;
export const MEMBER_STATUS_BLOCKED: number = 3;
export const MEMBER_STATUS_DELETED: number = 4;

// Redirecciones
export const REDIRECT_HOME: string = "/";
export const REDIRECT_LOGIN: string = "/(auth)/login";
export const REDIRECT_LOGOUT: string = "/(auth)/logout";
export const REDIRECT_REGISTER: string = "/(auth)/register";
export const REDIRECT_PROFILE: string = "/(profile)";
export const REDIRECT_PROFILE_EDIT: string = "/(profile)/edit";
export const LOGIN_DEFAULT_REDIRECT: string = "/dashboard";
export const SIGNUP_DEFAULT_REDIRECT: string = "/login";
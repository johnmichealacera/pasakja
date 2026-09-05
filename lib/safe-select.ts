/** Never include the raw User row (bcrypt password hash) in a client-facing response. */
export const SAFE_USER_SELECT = {
  id: true,
  name: true,
  phone: true,
  profileImage: true,
} satisfies Record<string, boolean>;

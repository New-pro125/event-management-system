import { z } from "zod";
import { zfd } from "zod-form-data";
import { VALIDATION_LIMITS } from "./../../i18n/index";

const { nameMin, passwordMin } = VALIDATION_LIMITS;
const nameField = () => z.string().min(nameMin, "validation:name.min");
const emailField = () => z.string().email("validation:email.invalid");
const passwordField = () =>
  z.string().min(passwordMin, "validation:password.min");

export const userCredentialsSchema = z.object({
  name: nameField(),
  email: emailField(),
  password: passwordField(),
});

export const userEditSchema = zfd.formData({
  id: zfd.numeric(z.number()),
  name: zfd.text(nameField()),
  bio: zfd.text().optional(),
  photo: zfd.file().optional(),
});

export const changeEmailSchema = z.object({
  email: emailField(),
  password: passwordField(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  newPassword: passwordField(),
});

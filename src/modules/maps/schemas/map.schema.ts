import { z } from "zod";

export const createMapSchema = z.object({
  workspaceId: z.string().uuid("Selecciona un workspace valido."),
  courseId: z.string().uuid().optional(),
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres.").max(120),
  description: z.string().max(500).optional(),
});
